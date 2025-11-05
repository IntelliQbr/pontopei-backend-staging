import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { SubscriptionLimitsService } from "../services/subscription-limits.service";

@Controller("/subscription-limits")
@UseGuards(AuthGuard, RolesGuard)
export class SubscriptionLimitsController {
    constructor(
        private readonly subscriptionLimitsService: SubscriptionLimitsService,
    ) {}

    @Get("/current")
    @Roles(["DIRECTOR", "TEACHER"])
    async findCurrentSubscriptionLimits(@UserAuth() user: UserWithProfile) {
        return this.subscriptionLimitsService.findCurrentSubscriptionLimits(
            user.profile.createdById ?? user.profile.id,
        );
    }
}
