import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, ProfileRole, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { CreateTeacherDto } from "../models/dtos/create/request-create-teacher.dto";
import { UpdateTeacherDto } from "../models/dtos/update/request-update-teacher.dto";

@Injectable()
export class TeachersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async create(createTeacherDto: CreateTeacherDto, directorId: string) {
        const director = await this.prismaService.profile.findUnique({
            where: { id: directorId, role: "DIRECTOR" },
            include: {
                subscription: true,
            },
        });

        if (!director || !director.subscription) {
            throw new NotFoundException("Diretor não encontrado.");
        }

        await this.validateTeacherEmail(createTeacherDto.email);

        const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);

        await this.prismaService.user.create({
            data: {
                email: createTeacherDto.email,
                fullName: createTeacherDto.fullName,
                password: hashedPassword,
                profile: {
                    create: {
                        role: ProfileRole.TEACHER,
                        schoolId: createTeacherDto.schoolId,
                        createdById: directorId,
                        avatarUrl: createTeacherDto.avatarUrl,
                        subscriptionId: director.subscription.id,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
    }

    private async validateTeacherEmail(
        email: string,
        notId?: string,
    ): Promise<void> {
        const existTeacher = await this.prismaService.user.findUnique({
            where: {
                email,
                NOT: { id: notId },
            },
        });

        if (existTeacher) {
            throw new BadRequestException("E-mail já está em uso.");
        }
    }

    async findAll(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{ teachers: User[]; total: number }> {
        const where: Prisma.UserWhereInput = {
            profile: {
                role: ProfileRole.TEACHER,
                createdById: directorId,
            },
        };

        if (query?.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
            ];
        }

        const [teachers, total] = await this.prismaService.$transaction([
            this.prismaService.user.findMany({
                where,
                include: {
                    profile: {
                        include: {
                            school: true,
                        },
                    },
                },
                take: query.take,
                skip: query.skip,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            this.prismaService.user.count({ where }),
        ]);

        return { teachers, total };
    }

    async update(
        id: string,
        dto: UpdateTeacherDto,
        directorId: string,
    ): Promise<User> {
        const teacher = await this.prismaService.user.findUnique({
            where: { id, profile: { createdById: directorId } },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado.");
        }

        if (dto.email) {
            const teacherAdminEmail = this.configService.getOrThrow<string>(
                "SUPER_ADMIN_TEACHER_EMAIL",
            );
            if (dto.email !== teacherAdminEmail) {
                throw new BadRequestException(
                    "Não é possível editar o e-mail do professor admin.",
                );
            }
            await this.validateTeacherEmail(dto.email, teacher.id);
        }

        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        return await this.prismaService.user.update({
            where: { id: teacher.id },
            data: {
                email: dto.email,
                fullName: dto.fullName,
                password: dto.password,
                profile: {
                    update: {
                        avatarUrl: dto.avatarUrl,
                        schoolId: dto.schoolId,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
    }

    async remove(id: string, directorId: string): Promise<void> {
        const teacher = await this.prismaService.user.findUnique({
            where: {
                id,
                profile: {
                    role: ProfileRole.TEACHER,
                    createdById: directorId,
                },
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado.");
        }

        const teacherAdminEmail = this.configService.getOrThrow<string>(
            "SUPER_ADMIN_TEACHER_EMAIL",
        );
        if (teacher.email === teacherAdminEmail) {
            throw new BadRequestException(
                "Não é possível deletar o professor admin.",
            );
        }

        await this.prismaService.user.delete({
            where: { id: teacher.id },
        });
    }
}
