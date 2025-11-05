import { Module } from "@nestjs/common";
import { SubscriptionLimitsController } from "./controllers/subscription-limits.controller";
import { SubscriptionLimitsService } from "./services/subscription-limits.service";
import { SubscriptionsService } from "./services/subscriptions.service";

@Module({
    providers: [SubscriptionLimitsService, SubscriptionsService],
    controllers: [SubscriptionLimitsController],
    exports: [SubscriptionLimitsService, SubscriptionsService],
})
export class SubscriptionsModule {}
