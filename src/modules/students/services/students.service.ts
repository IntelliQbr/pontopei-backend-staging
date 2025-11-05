import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, Student } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestCreateStudentDto } from "../models/dtos/create/request-create-student.dto";
import { RequestUpdateStudentDto } from "../models/dtos/update/request-update-student.dto";
import { FindAllStudentsToDirectorQuery } from "../models/queries/find-all/find-all-students-to-director.query";
import { FindAllStudentsToTeacherQuery } from "../models/queries/find-all/find-all-students-to-teacher.query";

@Injectable()
export class StudentsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        dto: RequestCreateStudentDto,
        teacherId: string,
    ): Promise<Student> {
        const teacher = await this.prisma.profile.findUnique({
            where: {
                id: teacherId,
                role: "TEACHER",
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado");
        }

        const classroom = await this.prisma.classroom.findUnique({
            where: {
                id: dto.classroomId,
            },
        });

        if (!classroom) {
            throw new NotFoundException("Turma não encontrada");
        }

        const school = await this.prisma.school.findUnique({
            where: {
                id: classroom.schoolId,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada");
        }

        const student = await this.prisma.student.create({
            data: {
                fullName: dto.fullName,
                photoUrl: dto.photoUrl,
                dateOfBirth: new Date(dto.dateOfBirth).toISOString(),
                schoolId: classroom.schoolId,
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
                createdById: teacher.id,
                parentGuardian: dto.parentGuardian,
                cid: dto.cid,
                gender: dto.gender,
            },
        });

        await this.prisma.classroomAssignment.create({
            data: {
                studentId: student.id,
                teacherId: teacher.id,
                classroomId: dto.classroomId,
            },
        });

        return student;
    }

    async findAllToDirector(
        query: FindAllStudentsToDirectorQuery,
        directorId: string,
    ): Promise<{
        students: Student[];
        total: number;
    }> {
        const where: Prisma.StudentWhereInput = {
            school: {
                createdById: directorId,
                id: query.schoolId,
            },
            fullName: {
                contains: query.search,
                mode: "insensitive",
            },
            classroomAssignment: {
                classroomId: query.classroomId,
                classroom: {
                    period: query.classPeriod,
                },
                teacherId: query.teacherId,
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

    async findAllToTeacher(
        query: FindAllStudentsToTeacherQuery,
        teacherId: string,
    ): Promise<{
        students: Student[];
        total: number;
    }> {
        const where: Prisma.StudentWhereInput = {
            fullName: {
                contains: query.search,
                mode: "insensitive",
            },
            classroomAssignment: {
                teacherId: teacherId,
                classroomId: query.classroomId,
                classroom: {
                    period: query.classPeriod,
                },
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

    async findOne(studentId: string, directorId: string): Promise<Student> {
        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                school: {
                    createdById: directorId,
                },
            },
            include: {
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

    async update(
        dto: RequestUpdateStudentDto,
        studentId: string,
        directorId: string,
    ): Promise<Student> {
        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                school: {
                    createdById: directorId,
                },
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

    async remove(studentId: string, directorId: string): Promise<void> {
        try {
            await this.prisma.student.delete({
                where: {
                    id: studentId,
                    school: {
                        createdById: directorId,
                    },
                },
            });
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Erro ao remover aluno");
        }
    }

    async count(teacherId: string): Promise<number> {
        return await this.prisma.student.count({
            where: {
                classroomAssignment: {
                    teacherId,
                },
            },
        });
    }
}
