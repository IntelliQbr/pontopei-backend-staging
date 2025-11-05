import { Module } from "@nestjs/common";
import { AIModule } from "src/core/ai/ai.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { WeeklyPlansController } from "./controllers/weekly-plans.controller";
import { WeeklyPlansService } from "./services/weekly-plans.service";

@Module({
    imports: [AIModule, SubscriptionsModule],
    controllers: [WeeklyPlansController],
    providers: [WeeklyPlansService],
})
export class WeeklyPlansModule {}
