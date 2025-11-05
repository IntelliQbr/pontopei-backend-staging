import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { omit } from "lodash";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestSignInDto } from "../models/dtos/sign-in/request-sign-in.dto";
import { ResponseSignInDto } from "../models/dtos/sign-in/response-sign-in.dto";
import { RequestSignUpDto } from "../models/dtos/sign-up/request-sign-up.dto";

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ) {}

    async signUp(dto: RequestSignUpDto): Promise<void> {
        const { password, confirmPassword } = dto;

        if (password !== confirmPassword) {
            throw new BadRequestException("As senhas não coincidem.");
        }

        const user = await this.findUserByEmail(dto.email);

        if (user) {
            throw new BadRequestException("Email já cadastrado.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prismaService.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                profile: {
                    create: {
                        role: "DIRECTOR",
                    },
                },
            },
        });
    }

    private findUserByEmail(email: string) {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: {
                profile: {
                    include: {
                        subscription: {
                            include: {
                                limits: true,
                                features: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async signIn(dto: RequestSignInDto): Promise<ResponseSignInDto> {
        const user = await this.findUserByEmail(dto.email);

        if (!user) {
            throw new NotFoundException("Email não cadastrado.");
        }

        const { password, ...userWithoutPassword } = user;

        if (password) {
            const isPasswordValid = await bcrypt.compare(
                dto.password,
                password,
            );

            if (!isPasswordValid) {
                throw new UnauthorizedException("Senha inválida.");
            }
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };
        const token = await this.jwtService.signAsync(payload);

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async findUserByToken(token: string): Promise<Omit<User, "password">> {
        try {
            const payload = await this.jwtService.verifyAsync<{ sub: string }>(
                token,
            );

            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.sub,
                },
                include: {
                    profile: {
                        include: {
                            subscription: {
                                include: {
                                    limits: true,
                                    features: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            return omit(user, ["password"]);
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }
}
