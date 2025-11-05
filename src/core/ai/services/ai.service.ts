import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText, LanguageModel } from "ai";

@Injectable()
export class AIService {
    private modelId:
        | Parameters<typeof anthropic>[0]
        | Parameters<typeof google>[0];
    private model: LanguageModel;

    constructor(private configService: ConfigService) {
        const provider = this.configService.getOrThrow<"google" | "anthropic">(
            "AI_PROVIDER",
        );

        this.modelId = this.configService.getOrThrow("AI_MODEL");
        const providers: Record<"google" | "anthropic", LanguageModel> = {
            anthropic: anthropic(this.modelId),
            google: google(this.modelId),
        };

        this.model = providers[provider];
    }

    async generateText(prompt: string, systemPrompt: string) {
        const { text, usage } = await generateText({
            model: this.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            maxOutputTokens: 8000,
        });

        const inputTokens = usage?.inputTokens ?? 0;
        const outputTokens = usage?.outputTokens ?? 0;
        const totalTokens = usage?.totalTokens ?? 0;

        return {
            text,
            inputTokens,
            outputTokens,
            totalTokens,
        };
    }
}
