import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";

@Injectable()
export class AdminWeeklyPlansService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllByStudentId(
        studentId: string,
        query: Exclude<FindAllQuery, "search">,
    ) {
        const { skip, take } = query;

        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const [weeklyPlans, total] = await this.prisma.$transaction([
            this.prisma.weeklyPlan.findMany({
                where: {
                    studentId,
                },
                skip,
                take,
                orderBy: {
                    weekEnd: "desc",
                },
                include: {
                    student: true,
                },
            }),
            this.prisma.weeklyPlan.count({
                where: {
                    studentId,
                },
            }),
        ]);

        return {
            weeklyPlans,
            total,
        };
    }
}
