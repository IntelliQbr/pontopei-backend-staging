import { Module } from "@nestjs/common";
import { AIModule } from "../../core/ai/ai.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PEIController } from "./controllers/pei.controller";
import { PEIService } from "./services/pei.service";

@Module({
    imports: [AIModule, SubscriptionsModule],
    controllers: [PEIController],
    providers: [PEIService],
})
export class PEIModule {}
