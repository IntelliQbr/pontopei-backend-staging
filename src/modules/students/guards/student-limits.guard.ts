import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/core/database/services/prisma.service";
import { SubscriptionGuard } from "src/modules/subscriptions/guards/subscription.guard";
import { SubscriptionLimitsService } from "../../subscriptions/services/subscription-limits.service";

@Injectable()
export class StudentLimitsGuard
    extends SubscriptionGuard
    implements CanActivate
{
    constructor(
        private readonly subscriptionLimitsService: SubscriptionLimitsService,
        prisma: PrismaService,
    ) {
        super(prisma);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const request = context.switchToHttp().getRequest<Request>();

        const directorId =
            this.subscriptionLimitsService.getDirectorIdFromRequest(request);
        await this.subscriptionLimitsService.checkStudentsLimit(directorId);

        return true;
    }
}
