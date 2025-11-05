import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserWithProfile } from "src/core/models/user-with-profile.model";

export const userAuthFactory = (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request["user"] as UserWithProfile;
};

export const UserAuth = createParamDecorator(userAuthFactory);
