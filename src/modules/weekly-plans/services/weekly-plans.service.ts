import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { format } from "date-fns";
import { CreateWeeklyPlanContentType } from "src/core/ai/models/types/weekly-plans/create-weekly-plan-content.type";
import { WeeklyPlanAiService } from "src/core/ai/services/weekly-plan-ai.service";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { RequestCreateWeeklyPlanDto } from "../models/dtos/create/request-create-weekly-plan.dto";

@Injectable()
export class WeeklyPlansService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly weeklyPlanAiService: WeeklyPlanAiService,
    ) {}

    async create(dto: RequestCreateWeeklyPlanDto, teacherId: string) {
        const { studentId, ...rest } = dto;

        const teacher = await this.prisma.profile.findUnique({
            where: {
                id: teacherId,
            },
            include: {
                user: true,
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado");
        }

        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                classroomAssignment: {
                    teacherId,
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const previousWeeklyPlan = await this.prisma.weeklyPlan.findFirst({
            where: {
                studentId,
                createdById: teacherId,
            },
            orderBy: {
                weekStart: "desc",
            },
        });

        if (
            previousWeeklyPlan &&
            previousWeeklyPlan.weekEnd.getTime() > new Date().getTime()
        ) {
            throw new BadRequestException(
                `Você só pode criar um novo plano semanal em ${format(previousWeeklyPlan.weekEnd, "dd/MM/yyyy")}`,
            );
        }

        const previousPEI = await this.prisma.pEI.findFirst({
            where: {
                studentId,
                createdById: teacherId,
            },
            orderBy: {
                startDate: "desc",
            },
        });

        if (!previousPEI) {
            throw new NotFoundException("Não existe um PEI para este aluno");
        }

        // Criar o contudo do plano semanal + o plano semanal
        const contentConfig: CreateWeeklyPlanContentType = {
            ...rest,
            student,
            teacher,
            previousPEI,
        };

        const weeklyPlanContent =
            await this.weeklyPlanAiService.createWeeklyPlanContent(
                contentConfig,
            );

        const weeklyPlan = await this.prisma.weeklyPlan.create({
            data: {
                formQuestions: JSON.stringify(dto.formQuestions),
                weekActivities: JSON.stringify(dto.weekActivities),
                weekEnd: new Date(dto.weekEnd).toISOString(),
                weekStart: new Date(dto.weekStart).toISOString(),
                content: weeklyPlanContent,
                createdById: teacherId,
                studentId,
            },
        });

        return weeklyPlan;
    }

    async countToTeacher(teacherId: string) {
        return await this.prisma.weeklyPlan.count({
            where: {
                createdById: teacherId,
            },
        });
    }

    async findAllByStudentId(
        studentId: string,
        directorId: string,
        query: Exclude<FindAllQuery, "search">,
    ) {
        const { skip, take } = query;

        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                classroomAssignment: {
                    teacher: {
                        createdById: directorId,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const [weeklyPlans, total] = await Promise.all([
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
