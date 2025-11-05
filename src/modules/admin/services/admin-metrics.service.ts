import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/services/prisma.service";

@Injectable()
export class AdminMetricsService {
    constructor(private readonly prisma: PrismaService) {}

    async getSystemMetrics() {
        const [
            totalUsers,
            totalPEIs,
            totalStudents,
            totalWeeklyPlans,
            totalSchools,
            totalClassrooms,
            totalAIRequests,
            totalSubscriptions,
        ] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.pEI.count(),
            this.prisma.student.count(),
            this.prisma.weeklyPlan.count(),
            this.prisma.school.count(),
            this.prisma.classroom.count(),
            this.prisma.aIRequest.count(),
            this.prisma.subscription.count(),
        ]);

        return {
            totalUsers,
            totalPEIs,
            totalStudents,
            totalWeeklyPlans,
            totalSchools,
            totalClassrooms,
            totalAIRequests,
            totalSubscriptions,
        };
    }

    async getSubscriptionsChart() {
        const currentMonth = new Date().getMonth();

        const subscriptionsChart: {
            month: string;
            total: number;
            amount: number;
        }[] = [];

        for (let i = 0; i < 12; i++) {
            const month = (currentMonth - i) % 12;
            const year = new Date().getFullYear();

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const subscriptions = await this.prisma.subscription.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    NOT: {
                        status: "PENDING",
                    },
                },
            });

            subscriptionsChart.push({
                month: new Date(year, month, 1).toLocaleString("pt-BR", {
                    month: "long",
                }),
                total: subscriptions.length,
                amount: subscriptions.reduce(
                    (acc, subscription) => acc + (subscription.price ?? 0),
                    0,
                ),
            });
        }

        return subscriptionsChart.reverse();
    }

    async getLastProfiles() {
        const lastUsers = await this.prisma.profile.findMany({
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        return lastUsers;
    }
}
