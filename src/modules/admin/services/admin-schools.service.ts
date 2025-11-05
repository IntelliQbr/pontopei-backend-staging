import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, School } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { SchoolsService } from "src/modules/schools/services/schools.service";
import { RequestAdminCreateSchoolDto } from "../models/dtos/schools/request-admin-create-school.dto";
import { RequestAdminUpdateSchoolDto } from "../models/dtos/schools/request-admin-update-school.dto";

@Injectable()
export class AdminSchoolsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly schoolsService: SchoolsService,
    ) {}

    async findAllSchools(query: FindAllQuery): Promise<{
        schools: School[];
        total: number;
    }> {
        const { skip, take, search } = query;

        const where: Prisma.SchoolWhereInput = {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    address: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    createdBy: {
                        user: {
                            OR: [
                                {
                                    fullName: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    email: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
        };

        const [schools, total] = await this.prisma.$transaction([
            this.prisma.school.findMany({
                skip,
                take,
                where: query.search ? where : {},
                include: {
                    createdBy: {
                        include: {
                            user: true,
                        },
                    },
                    profiles: {
                        include: {
                            user: true,
                        },
                    },
                },
            }),
            this.prisma.school.count({
                where: query.search ? where : {},
            }),
        ]);

        return {
            schools,
            total,
        };
    }

    async findAllSchoolsByDirectorId(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{
        schools: School[];
        total: number;
    }> {
        return this.schoolsService.findAll(query, directorId);
    }

    async createSchool(dto: RequestAdminCreateSchoolDto): Promise<School> {
        const { directorId, ...rest } = dto;
        return this.schoolsService.create(rest, directorId);
    }

    async updateSchool(
        id: string,
        dto: RequestAdminUpdateSchoolDto,
    ): Promise<School> {
        const { directorId, ...rest } = dto;

        const school = await this.prisma.school.findUnique({
            where: {
                id,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada.");
        }

        if (dto.name) {
            await this.schoolsService.validateSchoolName(dto.name, id);
        }

        return this.prisma.school.update({
            where: { id },
            data: {
                ...rest,
                createdById: directorId,
            },
        });
    }

    async removeSchool(id: string): Promise<void> {
        const school = await this.prisma.school.findUnique({
            where: {
                id,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada.");
        }

        await this.prisma.school.delete({
            where: {
                id,
            },
        });
    }
}
