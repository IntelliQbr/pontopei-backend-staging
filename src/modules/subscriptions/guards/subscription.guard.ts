import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/services/prisma.service";
import { UserWithProfile } from "src/core/models/user-with-profile.model";

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request["user"] as UserWithProfile;

        if (!user || !user?.profile) {
            throw new UnauthorizedException("Você não está autenticado.");
        }

        if (user?.isAdmin) return true;

        const subscription = await this.prisma.subscription.findFirst({
            where: {
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
                profiles: {
                    some: {
                        id: user.profile.id,
                    },
                },
            },
        });

        if (!subscription) {
            throw new UnauthorizedException(
                "Você não possui uma assinatura ativa.",
            );
        }

        return true;
    }
}
