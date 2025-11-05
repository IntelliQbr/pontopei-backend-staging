import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import Stripe from "stripe";
import { RequestSubscribePlanDto } from "../models/dtos/request-subscribe-plan.dto";
import { PaymentsService } from "../services/payments.service";

@Controller("/payments")
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(
        private paymentsService: PaymentsService,
        private configService: ConfigService,
    ) {}

    @Post("/subscribe")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(["DIRECTOR"])
    async subscribeToPlan(
        @UserAuth() user: UserWithProfile,
        @Body() dto: RequestSubscribePlanDto,
    ) {
        return this.paymentsService.subscribeToPlan(user, dto);
    }

    @Post("/cancel-subscription")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(["DIRECTOR"])
    async cancelSubscription(@UserAuth() director: UserWithProfile) {
        return this.paymentsService.cancelSubscription(director.profile.id);
    }

    @Post("/webhook")
    @HttpCode(HttpStatus.OK)
    async webhook(@Req() req: Request & { rawBody: Buffer }) {
        this.logger.debug(
            `Webhook Stripe recebido: ${req.headers["stripe-signature"] ? "Com assinatura" : "Sem assinatura"}`,
        );

        const signature = req.headers["stripe-signature"];
        const endpointSecret = this.configService.getOrThrow<string>(
            "STRIPE_WEBHOOK_SECRET",
        );

        if (!signature) {
            this.logger.error("Webhook sem assinatura Stripe");
            return { status: "error", message: "Missing signature" };
        }

        try {
            const event = this.paymentsService.stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                endpointSecret,
            );

            this.logger.log(`Processando evento Stripe: ${event.type}`);

            await this.handleStripeEvent(event);

            return {
                status: "success",
                message: `Event ${event.type} processed successfully`,
                eventId: event.id,
            };
        } catch (error) {
            this.logger.error(`Erro ao processar webhook: ${error}`);

            if (error instanceof Error && error.message.includes("timestamp")) {
                return {
                    status: "error",
                    message: "Invalid timestamp or signature",
                };
            }

            return {
                status: "error",
                message: "Webhook processing failed",
            };
        }
    }

    private async handleStripeEvent(event: Stripe.Event) {
        try {
            this.logger.log(
                `Manipulando evento: ${event.type} - ID: ${event.id}`,
            );

            const data = event.data.object as
                | Stripe.Subscription
                | Stripe.Invoice
                | Stripe.Charge
                | Stripe.PaymentMethod
                | Stripe.PaymentIntent
                | Stripe.Checkout.Session;

            switch (event.type) {
                // Eventos de Subscription
                case "customer.subscription.created":
                    await this.paymentsService.handleSubscriptionCreated(
                        data as Stripe.Subscription,
                    );
                    break;

                case "customer.subscription.updated":
                    await this.paymentsService.handleSubscriptionUpdated(
                        data as Stripe.Subscription,
                    );
                    break;

                case "customer.subscription.deleted":
                    await this.paymentsService.handleSubscriptionDeleted(
                        data.id as string,
                    );
                    break;

                // Eventos de Invoice
                case "invoice.paid":
                    await this.paymentsService.handleInvoicePaid(
                        data as Stripe.Invoice,
                    );
                    break;

                case "invoice.payment_succeeded":
                    this.logger.log(`Invoice payment succeeded: ${data.id}`);
                    // Este evento é similar ao invoice.paid, pode processar da mesma forma
                    await this.paymentsService.handleInvoicePaid(
                        data as Stripe.Invoice,
                    );
                    break;

                case "invoice.payment_failed":
                    await this.paymentsService.handleInvoicePaymentFailed(
                        data as Stripe.Invoice,
                    );
                    break;

                // Eventos de Checkout Session
                case "checkout.session.completed":
                    this.logger.log(`Checkout session completada: ${data.id}`);
                    break;

                // Eventos de Payment (para monitoramento)
                case "charge.succeeded":
                    this.logger.log(`Charge succeeded: ${data.id}`);
                    break;

                case "payment_method.attached":
                    this.logger.log(`Payment method attached: ${data.id}`);
                    break;

                case "payment_intent.succeeded":
                    this.logger.log(`Payment intent succeeded: ${data.id}`);
                    break;

                case "payment_intent.created":
                    this.logger.log(`Payment intent created: ${data.id}`);
                    break;

                // Eventos de Invoice (para monitoramento)
                case "invoice.created":
                    this.logger.log(`Invoice created: ${data.id}`);
                    break;

                case "invoice.finalized":
                    this.logger.log(`Invoice finalized: ${data.id}`);
                    break;

                // Eventos não implementados
                default:
                    this.logger.warn(`Evento não tratado: ${event.type}`);
                    break;
            }
        } catch (error) {
            this.logger.error(
                `Erro ao processar evento ${event.type}: ${error}`,
            );

            // Re-throw o erro para que o Stripe saiba que houve falha
            // e tente reenviar o webhook
            throw error;
        }
    }
}
