import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";

@Injectable()
export class AdminNotesService {
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

        const [notes, total] = await this.prisma.$transaction([
            this.prisma.note.findMany({
                where: {
                    studentId,
                },
                skip,
                take,
            }),

            this.prisma.note.count({
                where: {
                    studentId,
                },
            }),
        ]);

        return {
            notes,
            total,
        };
    }
}
