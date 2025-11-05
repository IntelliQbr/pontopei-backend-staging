import { Injectable, NotFoundException } from "@nestjs/common";
import { Classroom, Prisma } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { RequestCreateClassroomDto } from "../models/dtos/create/request-create-classroom.dto";
import { RequestUpdateClassroomDto } from "../models/dtos/update/request-update-classroom.dto";

@Injectable()
export class ClassroomsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        { schoolId, ...rest }: RequestCreateClassroomDto,
        createdById: string,
    ): Promise<Classroom> {
        const school = await this.prismaService.school.findUnique({
            where: {
                id: schoolId,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada");
        }

        const classroom = await this.prismaService.classroom.create({
            data: {
                ...rest,
                school: {
                    connect: {
                        id: schoolId,
                    },
                },
                createdBy: {
                    connect: {
                        id: createdById,
                    },
                },
            },
        });
        return classroom;
    }

    async findAllToDirector(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{ classrooms: Classroom[]; total: number }> {
        const where: Prisma.ClassroomWhereInput = {
            school: {
                createdById: directorId,
            },
        };

        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { grade: { contains: query.search, mode: "insensitive" } },
            ];
        }

        const [classrooms, total] = await Promise.all([
            this.prismaService.classroom.findMany({
                where,
                skip: query.skip,
                take: query.take,
                include: {
                    school: true,
                    assignments: true,
                },
            }),
            this.prismaService.classroom.count({ where }),
        ]);
        return {
            classrooms,
            total,
        };
    }

    async findOne(id: string, directorId: string): Promise<Classroom> {
        const classroom = await this.prismaService.classroom.findUnique({
            where: {
                id,
                school: {
                    createdById: directorId,
                },
            },
        });

        if (!classroom) {
            throw new NotFoundException("Sala de aula não encontrada");
        }

        return classroom;
    }

    async update(
        id: string,
        requestUpdateClassroomDto: RequestUpdateClassroomDto,
        directorId: string,
    ): Promise<Classroom> {
        await this.findOne(id, directorId);
        const classroom = await this.prismaService.classroom.update({
            where: {
                id,
                school: {
                    createdById: directorId,
                },
            },
            data: requestUpdateClassroomDto,
        });
        return classroom;
    }

    async remove(id: string, directorId: string): Promise<void> {
        await this.findOne(id, directorId);
        await this.prismaService.classroom.delete({
            where: {
                id,
                school: {
                    createdById: directorId,
                },
            },
        });
    }

    async count(directorId: string): Promise<number> {
        return await this.prismaService.classroom.count({
            where: {
                school: {
                    createdById: directorId,
                },
            },
        });
    }
}
