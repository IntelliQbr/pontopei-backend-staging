import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/services/prisma.service";
import { RequestUpdateProfileDto } from "../models/dtos/request-update-profile.dto";

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}

    async updateProfile(dto: RequestUpdateProfileDto, userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: dto.fullName,
                email: dto.email,
                profile: {
                    update: {
                        avatarUrl: dto.avatarUrl,
                    },
                },
            },
        });
    }
}
