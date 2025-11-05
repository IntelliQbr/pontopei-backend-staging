import { ProfileRole } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { FindAllQuery } from "src/core/models/find-all-query";

export class FindAllUsersQuery extends FindAllQuery {
    @IsEnum(ProfileRole)
    @IsOptional()
    role?: ProfileRole;
}
