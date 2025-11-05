import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/core/database/services/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();
        const token = this.extractTokenFromHeader(req);

        if (!token) {
            throw new UnauthorizedException(
                "Token de autenticação não encontrado.",
            );
        }

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
                            subscription: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            req["user"] = user;

            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new UnauthorizedException(
                "Token de autenticação inválido ou malformado.",
            );
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
