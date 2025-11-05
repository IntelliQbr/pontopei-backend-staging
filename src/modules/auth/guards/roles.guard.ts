import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ProfileRole } from "@prisma/client";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<ProfileRole[]>(
            Roles,
            context.getHandler(),
        );

        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request["user"] as UserWithProfile;

        if (!user || !user.profile) {
            throw new UnauthorizedException(
                "Apenas diretores podem acessar este recurso.",
            );
        }

        return roles.some((role) => user.profile.role === role);
    }
}
