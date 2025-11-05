import {
    BadRequestException,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, ProfileRole, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { omit } from "lodash";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestCreateUserDto } from "../models/dtos/users/request-create-user.dto";
import { RequestSetAdminDto } from "../models/dtos/users/request-set-admin.dto";
import { RequestUpdateUserDto } from "../models/dtos/users/request-update-user.dto";
import { FindAllUsersQuery } from "../models/queries/find-all-users.query";

@Injectable()
export class AdminUsersService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        const directorEmail =
            this.configService.getOrThrow<string>("SUPER_ADMIN_EMAIL");
        const directorPassword = this.configService.getOrThrow<string>(
            "SUPER_ADMIN_PASSWORD",
        );
        const teacherEmail = this.configService.getOrThrow<string>(
            "SUPER_ADMIN_TEACHER_EMAIL",
        );
        const teacherPassword = this.configService.getOrThrow<string>(
            "SUPER_ADMIN_TEACHER_PASSWORD",
        );

        const admin = await this.prisma.user.findUnique({
            where: {
                email: directorEmail,
                isAdmin: true,
            },
            include: {
                profile: true,
            },
        });

        if (!admin) {
            const subscription = await this.prisma.subscription.create({
                data: {
                    limits: {
                        create: {
                            maxStudents: 1000,
                            maxWeeklyPlans: 1000,
                            maxPeiPerTrimester: 1000,
                        },
                    },
                    features: {
                        create: {
                            premiumSupport: true,
                        },
                    },
                    planType: "PLUS",
                    status: "ACTIVE",
                    startDate: new Date(),
                    endDate: new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1),
                    ),
                    price: 999,
                    externalId: "admin-subscription",
                },
            });

            const directorPasswordHashed = await bcrypt.hash(
                directorPassword,
                10,
            );
            const director = await this.prisma.user.create({
                data: {
                    email: directorEmail,
                    password: directorPasswordHashed,
                    isAdmin: true,
                    fullName: "Administrador do Sistema",
                    profile: {
                        create: {
                            role: ProfileRole.DIRECTOR,
                            subscriptionId: subscription.id,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });

            const teacherPasswordHashed = await bcrypt.hash(
                teacherPassword,
                10,
            );
            await this.prisma.user.create({
                data: {
                    email: teacherEmail,
                    password: teacherPasswordHashed,
                    isAdmin: true,
                    fullName: "Professor Admin",
                    profile: {
                        create: {
                            role: ProfileRole.TEACHER,
                            createdById: director.profile?.id,
                            subscriptionId: subscription.id,
                        },
                    },
                },
            });
        }
    }

    async createUser(
        dto: RequestCreateUserDto,
    ): Promise<Exclude<User, "password">> {
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (userExists) {
            throw new BadRequestException("Email já cadastrado.");
        }

        if (dto.directorId && dto.schoolId) {
            await this.validateDirectorAndSchool(dto.directorId, dto.schoolId);
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                profile: {
                    create: {
                        role: dto.role,
                        createdById: dto.directorId || undefined,
                        schoolId: dto.schoolId || undefined,
                    },
                },
            },
        });

        return omit(user, "password");
    }

    private async validateDirectorAndSchool(
        directorId: string,
        schoolId: string,
    ) {
        const director = await this.prisma.profile.findUnique({
            where: {
                id: directorId,
                role: ProfileRole.DIRECTOR,
            },
        });

        if (!director) {
            throw new NotFoundException("Diretor não encontrado.");
        }

        const school = await this.prisma.school.findUnique({
            where: {
                id: schoolId,
                createdById: director.id,
            },
        });

        if (!school) {
            throw new NotFoundException("Escola não encontrada.");
        }
    }

    async updateUser(
        userId: string,
        dto: RequestUpdateUserDto,
    ): Promise<Exclude<User, "password">> {
        const user = await this.findUserById(userId);

        if (dto?.directorId && dto?.schoolId) {
            await this.validateDirectorAndSchool(dto.directorId, dto.schoolId);
        }

        let hashedPassword = user.password;
        if (dto?.password) {
            hashedPassword = await bcrypt.hash(dto.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: dto.email,
                fullName: dto.fullName,
                password: hashedPassword,
                profile: {
                    update: {
                        role: dto.role,
                        createdById: dto.directorId || undefined,
                        schoolId: dto.schoolId || undefined,
                    },
                },
            },
        });

        return omit(updatedUser, "password") as Exclude<User, "password">;
    }

    private async findUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        return user;
    }

    async setAdmin(
        userId: string,
        dto: RequestSetAdminDto,
    ): Promise<Exclude<User, "password">> {
        const user = await this.findUserById(userId);

        const superAdminEmail =
            this.configService.getOrThrow<string>("SUPER_ADMIN_EMAIL");
        if (user.email === superAdminEmail) {
            throw new BadRequestException(
                "Não é possível alterar o status de administração do super administrador.",
            );
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isAdmin: dto.isAdmin,
            },
        });

        return omit(updatedUser, "password") as Exclude<User, "password">;
    }

    async removeUser(userId: string): Promise<void> {
        const user = await this.findUserById(userId);

        if (user.isAdmin) {
            throw new BadRequestException(
                "Não é possível remover um usuário administrador.",
            );
        }

        await this.prisma.user.delete({
            where: {
                id: userId,
            },
        });
    }

    async findAllUsers(query: FindAllUsersQuery): Promise<{
        users: User[];
        total: number;
    }> {
        const { skip, take } = query;

        const where: Prisma.UserWhereInput = {};

        if (query.search) {
            where.OR = [
                {
                    fullName: { contains: query.search, mode: "insensitive" },
                },
                { email: { contains: query.search, mode: "insensitive" } },
            ];
        }

        if (query?.role) {
            where.profile = {
                role: query.role,
            };
        }

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take,
                where,
                include: {
                    profile: {
                        include: {
                            subscription: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({
                where,
            }),
        ]);

        return {
            users,
            total,
        };
    }
}
