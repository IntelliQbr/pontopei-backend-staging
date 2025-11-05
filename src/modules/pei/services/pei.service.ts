import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CreatePEIContentType } from "src/core/ai/models/types/peis/create-pei-content.type";
import { RenewPEIContentType } from "src/core/ai/models/types/peis/renew-pei-content.type";
import { PEIAIService } from "src/core/ai/services/pei-ai.service";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestCreatePEIDto } from "../models/create/request-create-pei.dto";
import { RequestRenewPEIDto } from "../models/dtos/renew/request-renew-pei.dto";
import { FindAllPEIQuery } from "../models/dtos/queries/find-all-pei.query";
import { omit } from "lodash";
import { PEI, Prisma, ProfileRole } from "@prisma/client";

@Injectable()
export class PEIService {
    constructor(
        private readonly peiAIService: PEIAIService,
        private readonly prisma: PrismaService,
    ) {}

    async createPEI(dto: RequestCreatePEIDto, teacherId: string): Promise<PEI> {
        const existPei = await this.prisma.pEI.findFirst({
            where: {
                studentId: dto.studentId,
                createdById: teacherId,
                isRenewal: false,
            },
        });

        if (existPei) {
            throw new BadRequestException("PEI já existe para este aluno");
        }

        const student = await this.prisma.student.findUnique({
            where: {
                id: dto.studentId,
            },
            include: {
                classroomAssignment: {
                    include: {
                        classroom: true,
                    },
                },
                school: true,
            },
        });

        if (!student || !student.classroomAssignment) {
            throw new NotFoundException(
                "Aluno não encontrado ou não possui turma",
            );
        }

        const teacher = await this.prisma.profile.findUnique({
            where: {
                id: teacherId,
                role: "TEACHER",
            },
            include: {
                user: true,
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado");
        }

        const peiEndDate = new Date(
            new Date().setMonth(new Date().getMonth() + 3),
        );
        const startDate = new Date();
        const peiContentConfig: CreatePEIContentType = {
            formQuestions: dto.formQuestions,
            secondFormQuestions: dto.secondFormQuestions,
            student,
            teacher,
            startDate,
            endDate: peiEndDate,
            classroom: student.classroomAssignment.classroom,
            school: student.school,
        };
        const peiContent =
            await this.peiAIService.createPEIContent(peiContentConfig);

        const pei = await this.prisma.pEI.create({
            data: {
                content: peiContent,
                studentId: dto.studentId,
                createdById: teacherId,
                startDate,
                endDate: peiEndDate,
                isRenewal: false,
                status: "ACTIVE",
                version: 1,
                formQuestions: dto.formQuestions,
                secondFormQuestions: dto.secondFormQuestions,
            },
        });

        return pei;
    }

    async renewPEI(dto: RequestRenewPEIDto, teacherId: string): Promise<PEI> {
        // Validações/Busca de dados
        const student = await this.prisma.student.findUnique({
            where: {
                id: dto.studentId,
            },
            include: {
                classroomAssignment: {
                    include: {
                        classroom: true,
                    },
                },
                school: true,
            },
        });

        if (!student || !student.classroomAssignment) {
            throw new NotFoundException(
                "Aluno não encontrado ou não possui turma",
            );
        }

        const teacher = await this.prisma.profile.findUnique({
            where: {
                id: teacherId,
                role: "TEACHER",
            },
            include: {
                user: true,
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado");
        }

        // Obtem o PEI anterior para usar como base para o novo PEI
        const previousPEI = await this.prisma.pEI.findFirst({
            where: {
                studentId: dto.studentId,
                createdById: teacherId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!previousPEI) {
            throw new NotFoundException("PEI anterior não encontrado");
        }

        if (previousPEI.status !== "EXPIRED") {
            throw new BadRequestException(
                "O PEI anterior não pode ser renovado pois não está expirado.",
            );
        }

        // Obtem as anotações de 3 meses anteriores
        const last3Months = new Date(
            new Date().setMonth(new Date().getMonth() - 3),
        );
        const latestNotes = await this.prisma.note.findMany({
            where: {
                studentId: dto.studentId,
                createdById: teacherId,
                createdAt: {
                    gte: last3Months,
                },
            },
        });

        // Cria o novo PEI com IA
        const peiEndDate = new Date(
            new Date().setMonth(new Date().getMonth() + 3),
        );
        const startDate = new Date();
        const peiContentConfig: RenewPEIContentType = {
            formQuestions: dto.formQuestions,
            secondFormQuestions: dto.secondFormQuestions,
            student,
            teacher,
            startDate,
            endDate: peiEndDate,
            classroom: student.classroomAssignment.classroom,
            school: student.school,
            previousPEI,
            latestNotes,
        };

        const peiContent =
            await this.peiAIService.renewPEIContent(peiContentConfig);

        const pei = await this.prisma.pEI.create({
            data: {
                content: peiContent,
                studentId: dto.studentId,
                createdById: teacherId,
                startDate,
                endDate: peiEndDate,
                isRenewal: true,
                status: "ACTIVE",
                version: previousPEI.version + 1,
                formQuestions: dto.formQuestions,
                secondFormQuestions: dto.secondFormQuestions,
            },
        });

        // Inativa o PEI anterior
        await this.prisma.pEI.update({
            where: {
                id: previousPEI.id,
            },
            data: {
                status: "INACTIVE",
            },
        });

        // Deleta as anotações de 3 meses anteriores
        await this.prisma.note.deleteMany({
            where: {
                studentId: dto.studentId,
                createdById: teacherId,
                createdAt: {
                    lte: last3Months,
                },
            },
        });

        return pei;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async updateExpiredPEIs() {
        const expiredPEIs = await this.prisma.pEI.findMany({
            where: {
                endDate: {
                    lt: new Date(),
                },
                status: "ACTIVE",
            },
            select: {
                id: true,
            },
        });

        for (const pei of expiredPEIs) {
            await this.prisma.pEI.update({
                where: { id: pei.id },
                data: { status: "EXPIRED" },
            });
        }
    }

    async activePEIsCountToDirector(directorId: string) {
        return await this.prisma.pEI.count({
            where: {
                status: "ACTIVE",
                student: {
                    classroomAssignment: {
                        classroom: {
                            createdById: directorId,
                        },
                    },
                },
            },
        });
    }

    async activePEIsCountToTeacher(teacherId: string) {
        return await this.prisma.pEI.count({
            where: {
                status: "ACTIVE",
                createdById: teacherId,
            },
        });
    }

    async expiringPEIsCountToDirector(directorId: string) {
        return await this.prisma.pEI.count({
            where: {
                status: "EXPIRED",
                student: {
                    classroomAssignment: {
                        classroom: {
                            createdById: directorId,
                        },
                    },
                },
            },
        });
    }

    async expiringPEIsCountToTeacher(teacherId: string) {
        return await this.prisma.pEI.count({
            where: {
                status: "EXPIRED",
                createdById: teacherId,
            },
        });
    }

    async latestsPEIsToDirector(directorId: string) {
        return await this.prisma.pEI.findMany({
            take: 5,
            where: {
                student: {
                    classroomAssignment: {
                        classroom: {
                            createdById: directorId,
                        },
                    },
                },
            },
            include: {
                student: {
                    include: {
                        classroomAssignment: {
                            include: {
                                classroom: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async latestsPEIsToTeacher(teacherId: string) {
        return await this.prisma.pEI.findMany({
            take: 5,
            where: {
                createdById: teacherId,
            },
            include: {
                student: {
                    include: {
                        classroomAssignment: {
                            include: {
                                classroom: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findLatestPEIByStudentId(studentId: string, teacherId: string) {
        return await this.prisma.pEI.findFirst({
            where: {
                studentId,
                createdById: teacherId,
            },
            include: {
                student: {
                    include: {
                        classroomAssignment: {
                            include: {
                                classroom: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}
