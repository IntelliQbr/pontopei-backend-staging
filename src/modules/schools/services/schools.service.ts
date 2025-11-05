import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, School } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { RequestCreateSchoolDto } from "../models/dtos/create/request-create.dto";
import { RequestUpdateSchoolDto } from "../models/dtos/update/request-update.dto";

@Injectable()
export class SchoolsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        dto: RequestCreateSchoolDto,
        directorId: string,
    ): Promise<School> {
        await this.validateSchoolName(dto.name);

        const school = await this.prisma.school.create({
            data: {
                name: dto.name,
                address: dto.address,
                createdById: directorId,
            },
        });

        return school;
    }

    async validateSchoolName(name: string, notId?: string): Promise<void> {
        const existingSchoolWithSameName = await this.prisma.school.findFirst({
            where: {
                name: name,
                id: { not: notId },
            },
        });

        if (existingSchoolWithSameName) {
            throw new BadRequestException(
                "Já existe uma escola com este nome.",
            );
        }
    }

    async update(
        id: string,
        dto: RequestUpdateSchoolDto,
        directorId: string,
    ): Promise<School> {
        const school = await this.prisma.school.findUnique({
            where: {
                id,
                createdById: directorId,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada.");
        }

        if (dto.name) {
            await this.validateSchoolName(dto.name, id);
        }

        return this.prisma.school.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, directorId: string): Promise<void> {
        const school = await this.prisma.school.findUnique({
            where: {
                id,
                createdById: directorId,
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

    async findAll(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{ schools: School[]; total: number }> {
        const where: Prisma.SchoolWhereInput = {
            createdById: directorId,
        };

        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { address: { contains: query.search, mode: "insensitive" } },
            ];
        }

        const [schools, total] = await this.prisma.$transaction([
            this.prisma.school.findMany({
                where,
                skip: query.skip,
                take: query.take,
                orderBy: { name: "asc" },
                include: {
                    profiles: {
                        where: {
                            role: "TEACHER",
                        },
                        include: {
                            classroomAssignments: true,
                        },
                    },
                },
            }),
            this.prisma.school.count({ where }),
        ]);

        return { schools, total };
    }

    async count(directorId: string): Promise<number> {
        return await this.prisma.school.count({
            where: {
                createdById: directorId,
            },
        });
    }
}
