import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";
import * as path from "path";
import { PrismaService } from "src/core/database/services/prisma.service";
import { CreateWeeklyPlanContentType } from "../models/types/weekly-plans/create-weekly-plan-content.type";
import { AIService } from "./ai.service";

@Injectable()
export class WeeklyPlanAiService {
    private aiModel: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AIService,
        private readonly configService: ConfigService,
    ) {
        this.aiModel = this.configService.getOrThrow<string>("AI_MODEL");
    }

    async createWeeklyPlanContent(config: CreateWeeklyPlanContentType) {
        const prompt = `
            # Use os dados abaixo para criar o plano semanal do aluno no formato MARKDOWN mas sem usar bloco de código.

            ## Início da semana
            ${config.weekStart}

            ## Fim da semana    
            ${config.weekEnd}

            ## Atividades da semana
            ${JSON.stringify(config.weekActivities)}

            ## Perguntas do formulário
            ${JSON.stringify(config.formQuestions)}

            ## PEI anterior
            ${JSON.stringify(config.previousPEI)}

            ## Dados do aluno
            ${JSON.stringify(config.student)}

            ## Dados do professor
            ${JSON.stringify(config.teacher)}
        `;

        const systemPrompt = readFileSync(
            path.join(__dirname, "..", "prompts", "weekly-plan.prompt.md"),
            "utf8",
        );

        const aiResponse = await this.aiService.generateText(
            prompt,
            systemPrompt,
        );

        try {
            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: aiResponse.text,
                    type: "WEEKLY_PLAN",
                    schoolId: config.student.schoolId,
                    userId: config.teacher.user.id,
                    status: "COMPLETED",
                    inputTokens: aiResponse.inputTokens,
                    outputTokens: aiResponse.outputTokens,
                    totalTokens: aiResponse.totalTokens,
                    model: this.aiModel,
                },
            });

            return aiResponse.text;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            const text = `Erro ao criar o plano semanal, ${errorMessage}`;

            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: text,
                    type: "WEEKLY_PLAN",
                    schoolId: config.teacher.schoolId!,
                    userId: config.teacher.user.id,
                    status: "ERROR",
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0,
                    model: this.aiModel,
                },
            });

            throw error;
        }
    }
}
