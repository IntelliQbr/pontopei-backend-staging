import { BadRequestException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PLANS_CONFIG } from "src/constants/plans.constants";
import { PrismaService } from "src/core/database/services/prisma.service";

@Injectable()
export class SubscriptionsService {
    constructor(private prismaService: PrismaService) {}

    async createByExternalData(
        planType: Exclude<SubscriptionPlan, "PLUS">,
        config: {
            externalId?: string;
            endDate?: string;
            customerId?: string;
        },
    ) {
        const planConfig = PLANS_CONFIG[planType];

        const subscription = await this.getSubscription({
            customerId: config.customerId,
            externalId: config.externalId,
        });

        const data: Prisma.SubscriptionCreateInput = {
            price: planConfig.price,
            planType,
            externalId: config.externalId || null,
            customerId: config.customerId || null,
            startDate: new Date().toISOString(),
            endDate: config.endDate || null,
            status: "PENDING",
        };

        if (subscription) {
            return await this.prismaService.subscription.update({
                where: { id: subscription.id },
                data: {
                    ...data,
                    features: {
                        update: {
                            premiumSupport: planConfig.features.premium_support,
                        },
                    },
                    limits: {
                        update: {
                            maxStudents: planConfig.limits.max_students,
                            maxPeiPerTrimester:
                                planConfig.limits.max_pei_per_trimester,
                            maxWeeklyPlans: planConfig.limits.max_weekly_plans,
                        },
                    },
                },
            });
        }

        return await this.prismaService.subscription.create({
            data: {
                ...data,
                features: {
                    create: {
                        premiumSupport: planConfig.features.premium_support,
                    },
                },
                limits: {
                    create: {
                        maxStudents: planConfig.limits.max_students,
                        maxPeiPerTrimester:
                            planConfig.limits.max_pei_per_trimester,
                        maxWeeklyPlans: planConfig.limits.max_weekly_plans,
                    },
                },
            },
        });
    }

    private async getSubscription(uniqueId: {
        externalId?: string;
        id?: string;
        customerId?: string;
    }) {
        const subscription = await this.prismaService.subscription.findFirst({
            where: {
                OR: [
                    { externalId: uniqueId.externalId },
                    { id: uniqueId.id },
                    { customerId: uniqueId.customerId },
                ],
            },
        });

        return subscription;
    }

    async updateByExternalData(
        uniqueId: {
            externalId?: string;
            id?: string;
            customerId?: string;
        },
        data: {
            endDate?: string;
            externalId?: string;
            customerId?: string;
            status?: SubscriptionStatus;
        },
    ) {
        const subscription = await this.getSubscription(uniqueId);

        if (!subscription) {
            throw new BadRequestException("Assinatura não encontrada");
        }

        return await this.prismaService.subscription.update({
            where: { id: subscription.id },
            data,
        });
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async removeUnusedSubscriptions() {
        const subscriptions = await this.prismaService.subscription.findMany({
            where: {
                createdAt: {
                    lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day
                },
                profiles: {
                    none: {
                        role: "DIRECTOR",
                    },
                },
            },
        });

        for (const subscription of subscriptions) {
            await this.prismaService.subscription.delete({
                where: {
                    id: subscription.id,
                },
            });
        }
    }
}
