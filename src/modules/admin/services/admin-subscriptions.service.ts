import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { PaymentsService } from "src/modules/payments/services/payments.service";
import { SubscriptionLimitsService } from "src/modules/subscriptions/services/subscription-limits.service";
import { RequestCreateCustomSubscriptionDto } from "../models/dtos/subscriptions/request-create-custom-subscription.dto";
import { RequestUpdateSubscriptionDto } from "../models/dtos/subscriptions/request-update-subscription.dto";
import { FindAllSubscriptionsQuery } from "../models/queries/find-all-subscriptions.query";

@Injectable()
export class AdminSubscriptionsService {
    private readonly logger = new Logger(AdminSubscriptionsService.name);

    constructor(
        private prismaService: PrismaService,
        private paymentsService: PaymentsService,
        private configService: ConfigService,
        private subscriptionLimitsService: SubscriptionLimitsService,
    ) {}

    async findAllSubscriptions(query: FindAllSubscriptionsQuery) {
        const where: Prisma.SubscriptionWhereInput = {
            status: query.status,
        };

        if (query.search) {
            where.profiles = {
                some: {
                    user: {
                        OR: [
                            {
                                fullName: {
                                    contains: query.search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                email: {
                                    contains: query.search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                },
            };
        }

        const [subscriptions, total] = await this.prismaService.$transaction([
            this.prismaService.subscription.findMany({
                where,
                include: {
                    features: true,
                    limits: true,
                    profiles: {
                        include: {
                            user: true,
                        },
                    },
                },
                skip: query.skip,
                take: query.take,
            }),
            this.prismaService.subscription.count({ where }),
        ]);

        return {
            subscriptions,
            total,
        };
    }

    async createCustomSubscription(dto: RequestCreateCustomSubscriptionDto) {
        const director = await this.prismaService.profile.findUnique({
            where: { id: dto.directorId },
            include: {
                user: true,
            },
        });

        if (!director) {
            throw new NotFoundException("Diretor não encontrado");
        }

        try {
            const startDateISO = new Date(dto.startDate).toISOString();
            const endDateISO = new Date(dto.endDate).toISOString();

            // Cria ou obtém o customer na Stripe
            const customer = await this.paymentsService.getOrCreateCustomer(
                director.user,
            );

            // Cria o produto personalizado na Stripe
            const product = await this.paymentsService.stripe.products.create({
                name: `Plano Plus Personalizado - ${director.user.fullName}`,
                metadata: {
                    planType: "PLUS",
                    directorId: dto.directorId,
                    isCustom: "true",
                },
            });

            // Cria o price baseado na frequência
            const recurring = {
                interval:
                    dto.frequencyType === "month"
                        ? ("month" as const)
                        : ("day" as const),
                interval_count: dto.frequency,
            };

            const price = await this.paymentsService.stripe.prices.create({
                product: product.id,
                unit_amount: dto.price * 100, // Stripe usa centavos
                currency: "brl",
                recurring,
                nickname: `Plano Plus Personalizado`,
            });

            // Cria a subscription no banco de dados
            const existSubscription =
                await this.prismaService.subscription.findFirst({
                    where: {
                        customerId: customer.id,
                    },
                });

            if (existSubscription) {
                await this.removeSubscription(existSubscription.id);
            }

            const subscription = await this.prismaService.subscription.create({
                data: {
                    price: dto.price,
                    planType: "PLUS",
                    status: "PENDING",
                    customerId: customer.id,
                    features: {
                        create: {
                            premiumSupport: dto.features.premiumSupport,
                        },
                    },
                    limits: {
                        create: {
                            maxStudents: dto.limits.maxStudents,
                            maxPeiPerTrimester: dto.limits.maxPeiPerTrimester,
                            maxWeeklyPlans: dto.limits.maxWeeklyPlans,
                        },
                    },
                    startDate: startDateISO,
                    endDate: endDateISO,
                },
            });

            await this.prismaService.profile.update({
                where: {
                    id: dto.directorId,
                },
                data: {
                    subscription: {
                        connect: {
                            id: subscription.id,
                        },
                    },
                    createdTeachers: {
                        updateMany: {
                            data: {
                                subscriptionId: subscription.id,
                            },
                            where: {
                                createdById: dto.directorId,
                            },
                        },
                    },
                },
            });

            // Cria a checkout session da Stripe
            const successUrl =
                this.configService.getOrThrow<string>("STRIPE_SUCCESS_URL");
            const cancelUrl =
                this.configService.getOrThrow<string>("STRIPE_CANCEL_URL");

            const isValidTrialDate =
                new Date(startDateISO).getTime() > new Date().getTime();

            const checkoutSession =
                await this.paymentsService.stripe.checkout.sessions.create({
                    customer: customer.id,
                    payment_method_types: ["card", "boleto"],
                    line_items: [
                        {
                            price: price.id,
                            quantity: 1,
                        },
                    ],
                    mode: "subscription",
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: {
                        userId: director.user.id,
                        directorId: dto.directorId,
                        subscriptionLocalId: subscription.id,
                        isCustom: "true",
                    },
                    subscription_data: {
                        metadata: {
                            userId: director.user.id,
                            directorId: dto.directorId,
                            subscriptionLocalId: subscription.id,
                            isCustom: "true",
                        },
                        trial_end: isValidTrialDate
                            ? Math.floor(
                                  new Date(startDateISO).getTime() / 1000,
                              )
                            : undefined,
                    },
                    customer_update: {
                        address: "auto",
                    },
                    locale: "pt-BR",
                });

            // Retorna a URL de checkout (similar ao init_point do MercadoPago)
            return {
                checkoutUrl: checkoutSession.url,
                id: checkoutSession.id,
                customer_id: customer.id,
            };
        } catch (error) {
            this.logger.error(error);
            throw new BadRequestException(error);
        }
    }

    async updateSubscription(
        subscriptionId: string,
        dto: RequestUpdateSubscriptionDto,
    ) {
        const subscription = await this.prismaService.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                profiles: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!subscription) {
            throw new NotFoundException("Assinatura não encontrada");
        }

        if (!subscription.externalId) {
            throw new BadRequestException(
                "Essa assinatura não pode ser atualizada pois não possui um ID externo.",
            );
        }

        if (subscription.status === "CANCELLED") {
            throw new BadRequestException(
                "Essa assinatura não pode ser atualizada pois está cancelada.",
            );
        }

        try {
            // Para atualizar uma subscription na Stripe, precisamos lidar com mudanças de preço
            if (dto.price !== subscription.price) {
                // Recupera a subscription atual da Stripe
                const stripeSubscription =
                    await this.paymentsService.stripe.subscriptions.retrieve(
                        subscription.externalId,
                    );

                // Se há mudança de preço, precisamos criar um novo price
                const user = subscription.profiles[0]?.user;
                if (user) {
                    // Cria um novo produto personalizado para o novo preço
                    const product =
                        await this.paymentsService.stripe.products.create({
                            name: `Plano Plus Personalizado Atualizado - ${user.fullName}`,
                            metadata: {
                                planType: dto.planType,
                                isCustom: "true",
                                updatedAt: new Date().toISOString(),
                            },
                        });

                    const price =
                        await this.paymentsService.stripe.prices.create({
                            product: product.id,
                            unit_amount: dto.price * 100,
                            currency: "brl",
                            recurring: { interval: "month" },
                            nickname: `Plano ${dto.planType} Atualizado`,
                        });

                    // Atualiza a subscription na Stripe com o novo price
                    await this.paymentsService.stripe.subscriptions.update(
                        subscription.externalId,
                        {
                            items: [
                                {
                                    id: stripeSubscription.items.data[0].id,
                                    price: price.id,
                                },
                            ],
                            proration_behavior: "create_prorations",
                        },
                    );
                }
            }

            // Atualiza o status na Stripe se necessário
            if (dto.status === "CANCELLED") {
                await this.paymentsService.stripe.subscriptions.cancel(
                    subscription.externalId,
                );
            } else if (
                dto.status === "ACTIVE" &&
                subscription.status !== "ACTIVE"
            ) {
                // Se está ativando uma subscription, não precisa fazer nada específico na Stripe
                // pois o webhook vai lidar com isso
            }

            const updatedSubscription =
                await this.prismaService.subscription.update({
                    where: { id: subscriptionId },
                    data: {
                        price: dto.price,
                        status: dto.status,
                        planType: dto.planType,
                        features: {
                            update: {
                                premiumSupport: dto.features.premiumSupport,
                            },
                        },
                        limits: {
                            update: {
                                maxStudents: dto.limits.maxStudents,
                                maxPeiPerTrimester:
                                    dto.limits.maxPeiPerTrimester,
                                maxWeeklyPlans: dto.limits.maxWeeklyPlans,
                            },
                        },
                    },
                });

            return updatedSubscription;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async removeSubscription(subscriptionId: string) {
        const subscription = await this.prismaService.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            throw new NotFoundException("Assinatura não encontrada");
        }

        try {
            if (
                subscription.externalId &&
                subscription.status !== "CANCELLED"
            ) {
                // Cancela a subscription na Stripe
                await this.paymentsService.stripe.subscriptions.cancel(
                    subscription.externalId,
                );
            }

            const deletedSubscription =
                await this.prismaService.subscription.delete({
                    where: { id: subscriptionId },
                });

            return deletedSubscription;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findSubscriptionLimits(directorId: string) {
        return this.subscriptionLimitsService.findCurrentSubscriptionLimits(
            directorId,
        );
    }
}
