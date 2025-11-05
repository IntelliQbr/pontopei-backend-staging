import { Injectable, NotFoundException } from "@nestjs/common";
import { Classroom, Prisma } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { ClassroomsService } from "src/modules/classrooms/services/classrooms.service";
import { RequestAdminCreateClassroomDto } from "../models/dtos/classrooms/request-admin-create-classroom.dto";
import { RequestAdminUpdateClassroomDto } from "../models/dtos/classrooms/request-admin-update-classroom.dto";

@Injectable()
export class AdminClassroomsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly classroomsService: ClassroomsService,
    ) {}

    async findAllClassrooms(query: FindAllQuery): Promise<{
        classrooms: Classroom[];
        total: number;
    }> {
        const { skip, take, search } = query;

        const where: Prisma.ClassroomWhereInput = {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    grade: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    school: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        };

        const [classrooms, total] = await this.prisma.$transaction([
            this.prisma.classroom.findMany({
                skip,
                take,
                where: query.search ? where : undefined,
                include: {
                    school: true,
                    createdBy: {
                        include: {
                            user: true,
                        },
                    },
                    assignments: {
                        include: {
                            student: true,
                        },
                    },
                },
            }),
            this.prisma.classroom.count({
                where: query.search ? where : undefined,
            }),
        ]);

        return {
            classrooms,
            total,
        };
    }

    async findAllClassroomsByDirectorId(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{
        classrooms: Classroom[];
        total: number;
    }> {
        return this.classroomsService.findAllToDirector(query, directorId);
    }

    async createClassroom(dto: RequestAdminCreateClassroomDto) {
        const { directorId, ...rest } = dto;
        return this.classroomsService.create(rest, directorId);
    }

    async updateClassroom(id: string, dto: RequestAdminUpdateClassroomDto) {
        const { directorId, ...rest } = dto;

        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
        });

        if (!classroom) {
            throw new NotFoundException("Sala de aula não encontrada.");
        }

        return this.prisma.classroom.update({
            where: { id },
            data: {
                ...rest,
                createdById: directorId,
            },
        });
    }

    async removeClassroom(id: string) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
        });

        if (!classroom) {
            throw new NotFoundException("Sala de aula não encontrada.");
        }

        await this.prisma.classroom.delete({
            where: { id },
        });
    }
}
