import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";
import * as path from "path";
import { PrismaService } from "src/core/database/services/prisma.service";
import { CreatePEIContentType } from "../models/types/peis/create-pei-content.type";
import { RenewPEIContentType } from "../models/types/peis/renew-pei-content.type";
import { AIService } from "./ai.service";

@Injectable()
export class PEIAIService {
    private aiModel: string;

    constructor(
        private readonly aiService: AIService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.aiModel = this.configService.getOrThrow<string>("AI_MODEL");
    }

    async createPEIContent(config: CreatePEIContentType) {
        const prompt = `
			# Com base nos seguintes dados:

			## Início do PEI
			${config.startDate.toISOString()}
			
			## Fim do PEI
			${config.endDate.toISOString()}

			## Aluno
			${JSON.stringify(config.student)}

			## Turma do aluno
			${JSON.stringify(config.classroom)}

			## Escola do aluno
			${JSON.stringify(config.school)}

			## Professor responsável pelo PEI
			${JSON.stringify(config.teacher)}

			## Questionário
			${JSON.stringify(config.formQuestions)}

			${config.secondFormQuestions ? `## Questionário Quantitativo
			${JSON.stringify(config.secondFormQuestions)}` : ''}

            ---
            
            # Gere um Plano de Ensino Individualizado (PEI) completo seguindo rigorosamente a estrutura das 9 seções obrigatórias:
            1. **Identificação do aluno**: Inclua diagnóstico detalhado baseado no CID informado, expandindo características típicas para a idade/série
            2. **Histórico e contexto**: Desenvolva contexto educacional baseado em padrões típicos do diagnóstico  
            3. **Avaliação pedagógica funcional**: Detalhe CADA área (acadêmica, social, comunicação, autonomia, sensorial, comportamental) com referência à BNCC quando aplicável
            4. **Metas e objetivos SMART**: Elabore 3-5 metas específicas, mensuráveis, atingíveis, relevantes e temporais (3 meses), com indicadores claros
            5. **Estratégias e adaptações pedagógicas**: Inclua metodologias específicas (ABA escolar, TEACCH, Montessori adaptado, Vygotsky, etc.) com exemplos práticos e recursos de baixo custo
            6. **Monitoramento e revisão**: Detalhe instrumentos, frequência e responsáveis pelo acompanhamento
            7. **Dicas neuroeducacionais**: Forneça sugestões baseadas em neurociência aplicada para ambiente, ritmo, processamento sensorial e estratégias de ensino
            8. **Orientações para a família**: Desenvolva atividades específicas para continuidade em casa, parceria escola-família e observação de progresso
            9. **Roteiro de observações**: Liste 5-8 aspectos específicos que a professora deve observar nos próximos 3 meses para enriquecer a próxima renovação

            IMPORTANTE: Desenvolva cada seção com profundidade e relevância prática. Se os dados fornecidos forem limitados, expanda inteligentemente baseado em características típicas do diagnóstico para a idade/série, sempre mantendo foco na aplicabilidade pedagógica real. Complete TODAS as 9 seções obrigatórias.
		`;

        const systemPrompt = readFileSync(
            path.join(__dirname, "..", "prompts", "pei.prompt.md"),
            "utf8",
        );

        try {
            const aiResponse = await this.aiService.generateText(
                prompt,
                systemPrompt,
            );

            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: aiResponse.text,
                    type: "PEI_CREATION",
                    schoolId: config.teacher.schoolId!,
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
            const text = `Erro ao gerar o PEI, ${errorMessage}`;

            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: text,
                    type: "PEI_CREATION",
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

    async renewPEIContent(config: RenewPEIContentType) {
        const prompt = `
			# Use os dados abaixo para criar o PEI do aluno no formato MARKDOWN mas sem usar bloco de código.

			## Início do PEI
			${config.startDate.toISOString()}
			
			## Fim do PEI
			${config.endDate.toISOString()}

			## PEI anterior
			${JSON.stringify(config.previousPEI)}

			## Anotações de 3 meses anteriores
			${JSON.stringify(config.latestNotes)}

			## Aluno
			${JSON.stringify(config.student)}

			## Turma do aluno
			${JSON.stringify(config.classroom)}

			## Escola do aluno
			${JSON.stringify(config.school)}

			## Professor responsável pelo PEI
			${JSON.stringify(config.teacher)}

			## Questionário
			${JSON.stringify(config.formQuestions)}

			${config.secondFormQuestions ? `## Questionário Quantitativo
			${JSON.stringify(config.secondFormQuestions)}` : ''}
		`;

        const systemPrompt = readFileSync(
            path.join(__dirname, "..", "prompts", "pei.prompt.md"),
            "utf8",
        );

        try {
            const aiResponse = await this.aiService.generateText(
                prompt,
                systemPrompt,
            );

            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: aiResponse.text,
                    type: "PEI_RENEWAL",
                    schoolId: config.teacher.schoolId!,
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
            const text = `Erro ao renovar o PEI, ${errorMessage}`;

            await this.prisma.aIRequest.create({
                data: {
                    inputData: prompt,
                    outputData: text,
                    type: "PEI_RENEWAL",
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
