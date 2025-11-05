import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";

@Injectable()
export class AdminAIRequestsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllAIRequests(query: FindAllQuery) {
        const { skip, take } = query;

        const where: Prisma.AIRequestWhereInput = {
            OR: [
                { inputData: { contains: query.search, mode: "insensitive" } },
                { outputData: { contains: query.search, mode: "insensitive" } },
            ],
        };

        const [aiRequests, total] = await this.prisma.$transaction([
            this.prisma.aIRequest.findMany({
                where: query.search ? where : {},
                skip,
                take,

                select: {
                    id: true,
                    type: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    inputTokens: true,
                    outputTokens: true,
                    totalTokens: true,
                    model: true,
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            this.prisma.aIRequest.count({
                where: query.search ? where : {},
            }),
        ]);

        return {
            aiRequests,
            total,
        };
    }
}
