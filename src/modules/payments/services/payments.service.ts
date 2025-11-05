import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SubscriptionStatus, User } from "@prisma/client";
import { PlanConfig, PLANS_CONFIG } from "src/constants/plans.constants";
import { PrismaService } from "src/core/database/services/prisma.service";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { SubscriptionsService } from "src/modules/subscriptions/services/subscriptions.service";
import Stripe from "stripe";
import { RequestSubscribePlanDto } from "../models/dtos/request-subscribe-plan.dto";

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    public stripe: Stripe;

    constructor(
        private configService: ConfigService,
        private prismaService: PrismaService,
        private subscriptionsService: SubscriptionsService,
    ) {
        this.stripe = new Stripe(
            this.configService.getOrThrow<string>("STRIPE_SECRET_KEY"),
            {
                typescript: true,
            },
        );
    }

    async subscribeToPlan(user: UserWithProfile, dto: RequestSubscribePlanDto) {
        try {
            const planConfig = PLANS_CONFIG[dto.planType];

            if (!planConfig) {
                throw new BadRequestException(
                    `Plano ${dto.planType} não encontrado`,
                );
            }

            // Verifica se o usuário já tem um customer na Stripe
            const customer = await this.getOrCreateCustomer(user);

            // Obtém ou cria o plano na Stripe
            const price = await this.getOrCreactePrice(
                dto.planType,
                planConfig,
            );

            const session = await this.createCheckoutSession(
                customer.id,
                price.id,
                user,
            );

            await this.subscriptionsService.createByExternalData(dto.planType, {
                customerId: customer.id,
            });

            return {
                checkoutUrl: session.url,
                sessionId: session.id,
                customerId: customer.id,
            };
        } catch (error) {
            this.logger.error(`Erro ao criar assinatura: ${error}`);
            throw new BadRequestException("Erro ao criar assinatura");
        }
    }

    async getOrCreateCustomer(user: User): Promise<Stripe.Customer> {
        try {
            const existingCustomers = await this.stripe.customers.list({
                email: user.email,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0];
            }

            return await this.stripe.customers.create({
                email: user.email,
                name: user.fullName,
                metadata: {
                    userId: user.id,
                },
            });
        } catch (error) {
            this.logger.error(`Erro ao buscar ou criar cliente: ${error}`);
            throw error;
        }
    }

    async getOrCreactePrice(
        planType: string,
        planConfig: PlanConfig,
        recurring?: Stripe.PriceCreateParams.Recurring,
    ): Promise<Stripe.Price> {
        try {
            const prices = await this.stripe.prices.list({
                lookup_keys: [`plan_${planType}`],
                expand: ["data.product"],
            });

            if (prices.data.length > 0) {
                return prices.data[0];
            }

            let product: Stripe.Product;
            const planName = `Plano ${planType}`;
            const products = await this.stripe.products.search({
                query: `active:"true" AND name:"${planName}"`,
                limit: 1,
            });

            if (products.data.length > 0) {
                product = products.data[0];
            } else {
                product = await this.stripe.products.create({
                    name: planName,
                    metadata: {
                        planType,
                    },
                });
            }

            if (!recurring) {
                recurring = {
                    interval: "month",
                    interval_count: 1,
                };
            }

            return await this.stripe.prices.create({
                product: product.id,
                unit_amount: planConfig.price * 100,
                currency: "brl",
                recurring,
                lookup_key: `plan_${planType}`,
                nickname: planName,
            });
        } catch (error) {
            this.logger.error(`Erro ao criar/obter price: ${error}`);
            throw error;
        }
    }

    async createCheckoutSession(
        customerId: string,
        priceId: string,
        user: User,
    ) {
        try {
            const successUrl =
                this.configService.getOrThrow<string>("STRIPE_SUCCESS_URL");
            const cancelUrl =
                this.configService.getOrThrow<string>("STRIPE_CANCEL_URL");

            return await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ["card", "boleto"],
                payment_method_options: {
                    card: {
                        request_three_d_secure: "automatic",
                    },
                },
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: user.id,
                },
                customer_update: {
                    address: "auto",
                },
                locale: "pt-BR",
            });
        } catch (error) {
            this.logger.error(`Erro ao criar sessão de checkout: ${error}`);
            throw error;
        }
    }

    async cancelSubscription(directorId: string) {
        this.logger.log(`Cancelando assinatura!`);
        const director = await this.prismaService.profile.findUnique({
            where: {
                id: directorId,
            },
            include: {
                subscription: true,
            },
        });

        if (!director) {
            throw new BadRequestException("Diretor não encontrado");
        }

        if (!director.subscription) {
            throw new BadRequestException("Diretor não possui assinatura");
        }

        if (!director.subscription.customerId) {
            throw new BadRequestException(
                "Diretor não possui assinatura na Stripe",
            );
        }

        try {
            const subscriptions = await this.stripe.subscriptions.list({
                customer: director.subscription.customerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length === 0) {
                throw new BadRequestException(
                    "Assinatura não encontrada na Stripe",
                );
            }

            const stripeSubscription = subscriptions.data[0];

            // Cancela na stripe
            const canceledSubscription = await this.stripe.subscriptions.cancel(
                stripeSubscription.id,
            );

            // Atualiza o status da assinatura no banco de dados
            await this.updateUserSubscriptionStatus(
                { externalId: director.subscription.externalId },
                "CANCELLED",
            );

            return canceledSubscription;
        } catch (error) {
            this.logger.error(`Erro ao cancelar assinatura: ${error}`);
            throw new BadRequestException("Erro ao cancelar assinatura");
        }
    }

    private async updateUserSubscriptionStatus(
        {
            subscriptionId,
            externalId,
        }: { subscriptionId?: string; externalId?: string | null },
        status: SubscriptionStatus,
    ) {
        const where = externalId ? { externalId } : { id: subscriptionId };

        const subscription = await this.prismaService.subscription.findUnique({
            where,
        });

        if (!subscription) {
            this.logger.error(
                `Assinatura não encontrada: ${JSON.stringify(where)}`,
            );
            throw new BadRequestException("Assinatura não encontrada");
        }

        await this.prismaService.subscription.update({
            where,
            data: {
                status: status,
            },
        });
    }

    // ===== WEBHOOK HANDLERS REFATORADOS =====

    async handleSubscriptionCreated(subscription: Stripe.Subscription) {
        try {
            this.logger.log(
                `Processando assinatura criada: ${subscription.id} - Status: ${subscription.status}`,
            );

            // Buscar subscription local pelo customerId
            const localSubscription =
                await this.prismaService.subscription.findFirst({
                    where: {
                        customerId: subscription.customer as string,
                        externalId: null,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

            if (localSubscription) {
                await this.prismaService.subscription.update({
                    where: { id: localSubscription.id },
                    data: {
                        status:
                            subscription.status === "active"
                                ? "ACTIVE"
                                : "PENDING",
                        externalId: subscription.id,
                    },
                });

                // Se já foi criada como ativa, ativar o usuário imediatamente
                if (subscription.status === "active") {
                    this.logger.log(
                        `Subscription criada já ativa, ativando usuário...`,
                    );
                    await this.handleSubscriptionActive(subscription);
                }
            } else {
                this.logger.warn(
                    `Subscription local não encontrada para customerId: ${subscription.customer as string}`,
                );
            }
        } catch (error) {
            this.logger.error(`Erro ao processar assinatura criada: ${error}`);
            throw error;
        }
    }

    async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        try {
            this.logger.log(
                `Processando assinatura atualizada: ${subscription.id} - Status: ${subscription.status}`,
            );

            switch (subscription.status) {
                case "active":
                    await this.handleSubscriptionActive(subscription);
                    break;
                case "canceled":
                    await this.handleSubscriptionCancelled(subscription.id);
                    break;
                case "past_due":
                    await this.updateUserSubscriptionStatus(
                        { externalId: subscription.id },
                        "PENDING",
                    );
                    break;
                case "unpaid":
                    await this.updateUserSubscriptionStatus(
                        { externalId: subscription.id },
                        "EXPIRED",
                    );
                    break;
                case "incomplete":
                case "incomplete_expired":
                    await this.updateUserSubscriptionStatus(
                        { externalId: subscription.id },
                        "CANCELLED",
                    );
                    break;
                default:
                    this.logger.warn(
                        `Status de subscription não tratado: ${subscription.status}`,
                    );
            }
        } catch (error) {
            this.logger.error(
                `Erro ao processar subscription atualizada: ${error}`,
            );
            throw error;
        }
    }

    async handleSubscriptionActive(subscription: Stripe.Subscription) {
        try {
            this.logger.log(
                `Ativando assinatura: ${subscription.id} - Status: ${subscription.status}`,
            );

            // Calcula a data de expiração (próximo ciclo)
            const currentPeriodEnd =
                subscription.items.data[0].current_period_end;
            const endDate = new Date(currentPeriodEnd * 1000).toISOString();

            // Primeiro, tentar buscar pela subscription local
            const localSubscription =
                await this.prismaService.subscription.findUnique({
                    where: { externalId: subscription.id },
                    include: {
                        profiles: {
                            include: { user: true },
                        },
                    },
                });

            let userId: string | undefined;

            if (localSubscription?.profiles[0]?.user) {
                userId = localSubscription.profiles[0].user.id;
                this.logger.log(
                    `UserId encontrado via subscription local: ${userId}`,
                );
            } else {
                // Fallback: buscar o customer para obter o userId dos metadados
                const customer = await this.stripe.customers.retrieve(
                    subscription.customer as string,
                );

                if (
                    customer &&
                    !customer.deleted &&
                    customer.metadata?.userId
                ) {
                    userId = customer.metadata.userId;
                    this.logger.log(
                        `UserId encontrado via customer metadata: ${userId}`,
                    );
                } else {
                    this.logger.error(
                        `UserId não encontrado para subscription: ${subscription.id}`,
                    );
                    this.logger.error(`Customer: ${JSON.stringify(customer)}`);
                    return;
                }
            }

            // Verifica se a assinatura já está ativa para evitar processamento duplicado
            if (localSubscription?.status === "ACTIVE") {
                this.logger.log(
                    `Assinatura ${subscription.id} já está ativa, pulando ativação`,
                );
                return;
            }

            await this.activateUserSubscription(
                subscription.id,
                userId,
                endDate,
            );
        } catch (error) {
            this.logger.error(`Erro ao processar assinatura ativa: ${error}`);
            throw error;
        }
    }

    private async activateUserSubscription(
        externalId: string,
        userId: string,
        endDate: string,
    ) {
        try {
            const subscription =
                await this.prismaService.subscription.findUnique({
                    where: {
                        externalId,
                    },
                });

            if (!subscription) {
                this.logger.error(
                    `Subscription não encontrada para externalId: ${externalId}`,
                );
                return;
            }

            // Verifica se a assinatura já está ativa para evitar processamento duplicado
            if (subscription.status === "ACTIVE") {
                this.logger.log(
                    `Assinatura ${subscription.id} já está ativa, pulando ativação`,
                );
                return;
            }

            this.logger.log(`Ativando assinatura no banco: ${subscription.id}`);

            await this.prismaService.profile.update({
                where: {
                    userId: userId,
                },
                data: {
                    subscription: {
                        connect: {
                            id: subscription.id,
                        },
                        update: {
                            status: "ACTIVE",
                            endDate,
                        },
                    },
                    createdTeachers: {
                        updateMany: {
                            data: {
                                subscriptionId: subscription.id,
                            },
                            where: {
                                subscriptionId: null,
                            },
                        },
                    },
                },
            });

            this.logger.log(
                `Assinatura ativada com sucesso: ${subscription.id}`,
            );
        } catch (error) {
            this.logger.error(`Erro ao ativar subscription no banco: ${error}`);
            throw error;
        }
    }

    async handleSubscriptionCancelled(externalId: string) {
        try {
            this.logger.log(`Cancelando assinatura: ${externalId}`);
            await this.updateUserSubscriptionStatus(
                { externalId },
                "CANCELLED",
            );
        } catch (error) {
            this.logger.error(
                `Erro ao processar assinatura cancelada: ${error}`,
            );
            throw error;
        }
    }

    async handleSubscriptionDeleted(externalId: string) {
        try {
            this.logger.log(`Subscription deletada: ${externalId}`);
            return this.handleSubscriptionCancelled(externalId);
        } catch (error) {
            this.logger.error(
                `Erro ao processar assinatura deletada: ${error}`,
            );
            throw error;
        }
    }

    async handleInvoicePaid(invoice: Stripe.Invoice) {
        try {
            this.logger.log(`Processando invoice paga: ${invoice.id}`);

            const subscriptionId = invoice.parent?.subscription_details
                ?.subscription as string;

            if (!subscriptionId) {
                this.logger.warn(
                    `Invoice ${invoice.id} não tem subscription associada`,
                );
                return;
            }

            // Verifica se a subscription local já está ativa
            const localSubscription =
                await this.prismaService.subscription.findUnique({
                    where: { externalId: subscriptionId },
                });

            if (localSubscription?.status === "ACTIVE") {
                this.logger.log(
                    `Subscription ${subscriptionId} já está ativa, apenas atualizando data de expiração`,
                );

                // Apenas atualizar a data de expiração
                const subscription =
                    await this.stripe.subscriptions.retrieve(subscriptionId);
                const currentPeriodEnd =
                    subscription.items.data[0].current_period_end;
                const endDate = new Date(currentPeriodEnd * 1000).toISOString();

                await this.prismaService.subscription.update({
                    where: { externalId: subscriptionId },
                    data: {
                        endDate,
                    },
                });
                return;
            }

            // Buscar a subscription completa da Stripe
            const subscription =
                await this.stripe.subscriptions.retrieve(subscriptionId);
            this.logger.log(
                `Subscription da Stripe recuperada: ${subscription.id} - Status: ${subscription.status}`,
            );

            // Se a subscription está ativa, ativar o usuário
            if (subscription.status === "active") {
                this.logger.log(
                    `Subscription ${subscription.id} está ativa, ativando usuário...`,
                );
                await this.handleSubscriptionActive(subscription);
            } else {
                const currentPeriodEnd =
                    subscription.items.data[0].current_period_end;

                const isTrial = subscription.status === "trialing";

                const endDate = new Date(
                    isTrial && subscription?.trial_end
                        ? subscription?.trial_end * 1000
                        : currentPeriodEnd * 1000,
                ).toISOString();

                const startDate =
                    isTrial && subscription?.trial_start
                        ? new Date(
                              subscription?.trial_start * 1000,
                          ).toISOString()
                        : localSubscription?.startDate;

                const updateStatus = isTrial
                    ? "ACTIVE"
                    : localSubscription?.status;

                if (localSubscription) {
                    await this.prismaService.subscription.update({
                        where: { externalId: subscriptionId },
                        data: {
                            endDate,
                            startDate,
                            status: updateStatus,
                        },
                    });
                    this.logger.log(
                        `Subscription ${subscriptionId} - data atualizada, status: ${subscription.status}`,
                    );
                } else {
                    this.logger.warn(
                        `Subscription local não encontrada para externalId: ${subscriptionId}`,
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Erro ao processar invoice paga: ${error}`);
            throw error;
        }
    }

    async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        try {
            this.logger.log(
                `Processando falha no pagamento da invoice: ${invoice.id}`,
            );

            const subscriptionId = invoice.parent?.subscription_details
                ?.subscription as string;

            if (subscriptionId) {
                await this.updateUserSubscriptionStatus(
                    { externalId: subscriptionId },
                    "PENDING",
                );
            }
        } catch (error) {
            this.logger.error(`Erro ao processar falha no pagamento: ${error}`);
            throw error;
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSubscriptionExpiredCron() {
        this.logger.log(`Verificando assinaturas expiradas!`);
        const subscriptions = await this.prismaService.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: {
                    lt: new Date(),
                },
            },
        });

        for (const subscription of subscriptions) {
            const admin = await this.prismaService.profile.findFirst({
                where: {
                    subscription: {
                        id: subscription.id,
                    },
                    user: {
                        isAdmin: true,
                    },
                },
            });

            if (admin) {
                continue;
            }

            const externalId = subscription.externalId;

            if (externalId) {
                try {
                    await this.handleSubscriptionCancelled(externalId);
                    await this.updateUserSubscriptionStatus(
                        { externalId },
                        "EXPIRED",
                    );
                } catch (error) {
                    this.logger.error(
                        `Erro ao processar assinatura expirada na Stripe: ${error}`,
                    );
                }
            }
        }
    }

    async getSubscriptionStatus(externalId: string) {
        try {
            const subscription =
                await this.stripe.subscriptions.retrieve(externalId);
            return subscription.status;
        } catch (error) {
            this.logger.error(
                `Erro ao verificar status da assinatura: ${error}`,
            );
            throw error;
        }
    }
}
