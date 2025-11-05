import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, Student } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestUpdateStudentDto } from "../../students/models/dtos/update/request-update-student.dto";
import { FindAllStudentsQuery } from "../models/queries/find-all-students.query";

@Injectable()
export class AdminStudentsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllStudents(query: FindAllStudentsQuery): Promise<{
        students: Student[];
        total: number;
    }> {
        const where: Prisma.StudentWhereInput = {
            fullName: {
                contains: query.search,
                mode: "insensitive",
            },
            classroomAssignment: {
                classroomId: query.classroomId,
                classroom: {
                    period: query.classPeriod,
                },
                teacher: {
                    id: query.teacherId,
                    createdById: query.directorId,
                },
            },
            school: {
                id: query.schoolId,
                createdById: query.directorId,
            },
            status: query.status,
        };

        const [students, total] = await this.prisma.$transaction([
            this.prisma.student.findMany({
                where,
                skip: query.skip,
                take: query.take,
                include: {
                    peis: true,
                    school: true,
                    medicalConditions: true,
                    classroomAssignment: {
                        include: {
                            teacher: {
                                include: {
                                    user: true,
                                },
                            },
                            classroom: true,
                        },
                    },
                },
            }),
            this.prisma.student.count({
                where,
            }),
        ]);

        return {
            students,
            total,
        };
    }

    async updateStudent(
        studentId: string,
        dto: RequestUpdateStudentDto,
    ): Promise<Student> {
        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const updatedStudent = await this.prisma.$transaction(async (tx) => {
            await tx.medicalCondition.deleteMany({
                where: {
                    studentId,
                },
            });

            return await tx.student.update({
                where: {
                    id: studentId,
                },
                data: {
                    fullName: dto.fullName,
                    photoUrl: dto.photoUrl,
                    gender: dto.gender,
                    dateOfBirth: new Date(dto.dateOfBirth).toISOString(),
                    specialNeeds: dto.specialNeeds,
                    medicalConditions: {
                        createMany: {
                            data:
                                dto.medicalConditions?.map((condition) => ({
                                    condition: condition.condition,
                                    age: condition.age,
                                })) ?? [],
                        },
                    },
                    hasCamping: dto.hasCamping,
                    parentGuardian: dto.parentGuardian,
                    cid: dto.cid,
                    classroomAssignment: {
                        update: {
                            teacherId: dto.teacherId,
                            classroomId: dto.classroomId,
                        },
                    },
                },
            });
        });

        return updatedStudent;
    }

    async findOneStudent(studentId: string): Promise<Student> {
        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
            },
            include: {
                notes: true,
                peis: true,
                school: true,
                weeklyPlans: true,
                medicalConditions: true,
                classroomAssignment: {
                    include: {
                        classroom: true,
                        teacher: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        return student;
    }

    async removeStudent(studentId: string): Promise<void> {
        try {
            await this.prisma.student.delete({
                where: {
                    id: studentId,
                },
            });
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Erro ao remover aluno");
        }
    }
}
