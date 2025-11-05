import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import {
    Subscription,
    SubscriptionFeature,
    SubscriptionLimit,
} from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "src/core/database/services/prisma.service";
import { UserWithProfile } from "src/core/models/user-with-profile.model";

@Injectable()
export class SubscriptionLimitsService {
    constructor(private readonly prisma: PrismaService) {}

    // Limite de criação de alunos
    async checkStudentsLimit(directorId: string) {
        const subscription = await this.getSubscription(directorId);

        const maxStudents = subscription.limits?.maxStudents;
        const studentsCount = await this.getStudentsCount(directorId);

        if (maxStudents && studentsCount >= maxStudents) {
            throw new BadRequestException(
                "Limite de alunos atingido. Por favor, atualize sua assinatura para continuar.",
            );
        }
    }

    private async getStudentsCount(directorId: string): Promise<number> {
        const studentsCount = await this.prisma.student.count({
            where: {
                classroomAssignment: {
                    classroom: {
                        createdById: directorId,
                    },
                },
            },
        });

        return studentsCount;
    }

    private async getSubscription(directorId: string): Promise<
        Subscription & {
            limits: SubscriptionLimit;
            features: SubscriptionFeature;
        }
    > {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                profiles: {
                    some: {
                        id: directorId,
                    },
                },
                OR: [
                    {
                        status: "ACTIVE",
                    },
                    {
                        status: "CANCELLED",
                        endDate: {
                            gte: new Date(),
                        },
                    },
                ],
            },
            include: {
                limits: true,
                features: true,
            },
        });

        if (!subscription) {
            throw new NotFoundException("Assinatura não encontrada.");
        }

        if (!subscription.limits || !subscription.features) {
            throw new NotFoundException(
                "Limites ou recursos da assinatura não encontrados.",
            );
        }

        return subscription as Subscription & {
            limits: SubscriptionLimit;
            features: SubscriptionFeature;
        };
    }

    // Limite de criação de planos semanais
    async checkWeeklyPlansLimit(directorId: string): Promise<void> {
        const subscription = await this.getSubscription(directorId);

        const maxWeeklyPlans = subscription.limits.maxWeeklyPlans;
        const weeklyPlansCount = await this.getWeeklyPlansCount(directorId);

        if (maxWeeklyPlans && weeklyPlansCount >= maxWeeklyPlans) {
            throw new BadRequestException(
                "Limite de planos semanais atingido. Por favor, atualize sua assinatura para continuar.",
            );
        }
    }

    private async getWeeklyPlansCount(directorId: string): Promise<number> {
        const weeklyPlansCount = await this.prisma.weeklyPlan.count({
            where: {
                createdBy: {
                    createdById: directorId,
                },
            },
        });

        return weeklyPlansCount;
    }

    // Limite de PEIs por trimestre
    async checkPeisPerTrimesterLimit(directorId: string): Promise<void> {
        const subscription = await this.getSubscription(directorId);

        const maxPeisPerTrimester = subscription.limits.maxPeiPerTrimester;
        const peisCount = await this.getPeisPerTrimesterCount(directorId);

        if (maxPeisPerTrimester && peisCount >= maxPeisPerTrimester) {
            throw new BadRequestException(
                "Limite de PEIs por trimestre atingido. Por favor, atualize sua assinatura para continuar.",
            );
        }
    }

    private async getPeisPerTrimesterCount(
        directorId: string,
    ): Promise<number> {
        const lastTrimester = new Date(
            new Date().setMonth(new Date().getMonth() - 3),
        );
        const peisCount = await this.prisma.pEI.count({
            where: {
                createdBy: {
                    createdById: directorId,
                },
                createdAt: {
                    gte: lastTrimester,
                    lte: new Date(),
                },
            },
        });

        return peisCount;
    }

    async findCurrentSubscriptionLimits(directorId: string): Promise<{
        maxStudents: number;
        maxWeeklyPlans: number;
        maxPeiPerTrimester: number;
    }> {
        return {
            maxStudents: await this.getStudentsCount(directorId),
            maxWeeklyPlans: await this.getWeeklyPlansCount(directorId),
            maxPeiPerTrimester: await this.getPeisPerTrimesterCount(directorId),
        };
    }

    getDirectorIdFromRequest(request: Request): string {
        const user = request["user"] as UserWithProfile;

        if (!user || !user.profile) {
            throw new UnauthorizedException("Usuário não autenticado.");
        }

        let directorId = user.profile.id;
        if (user.profile.role === "TEACHER" && user.profile?.createdById) {
            directorId = user.profile.createdById;
        }

        return directorId;
    }
}
