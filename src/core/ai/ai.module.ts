import { Module } from "@nestjs/common";
import { AIService } from "./services/ai.service";
import { PEIAIService } from "./services/pei-ai.service";
import { WeeklyPlanAiService } from "./services/weekly-plan-ai.service";

@Module({
    providers: [AIService, PEIAIService, WeeklyPlanAiService],
    exports: [PEIAIService, WeeklyPlanAiService],
})
export class AIModule {}
