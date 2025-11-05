import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/core/database/services/prisma.service";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { AuthGuard } from "../../auth/guards/auth.guard";

@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
    constructor(jwtService: JwtService, prismaService: PrismaService) {
        super(jwtService, prismaService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const request = context.switchToHttp().getRequest<Request>();
        const user = request["user"] as UserWithProfile;

        if (!user || !user.isAdmin) {
            throw new ForbiddenException(
                "Acesso negado. Você não tem permissão para acessar este recurso.",
            );
        }

        return true;
    }
}
