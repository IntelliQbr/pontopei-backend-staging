import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";

import { FindAllQuery } from "src/core/models/find-all-query";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { SubscriptionGuard } from "src/modules/subscriptions/guards/subscription.guard";
import { RequestCreateSchoolDto } from "../models/dtos/create/request-create.dto";
import { RequestUpdateSchoolDto } from "../models/dtos/update/request-update.dto";
import { SchoolsService } from "../services/schools.service";

@Controller("/schools")
@UseGuards(AuthGuard, RolesGuard)
export class SchoolsController {
    constructor(private readonly schoolsService: SchoolsService) {}

    @Post()
    @Roles(["DIRECTOR"])
    @UseGuards(SubscriptionGuard)
    async create(
        @Body() dto: RequestCreateSchoolDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.schoolsService.create(dto, director.profile.id);
    }

    @Get()
    @Roles(["DIRECTOR"])
    async findAll(
        @Query() query: FindAllQuery,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.schoolsService.findAll(query, director.profile.id);
    }

    @Put(":id")
    @Roles(["DIRECTOR"])
    async update(
        @Param("id") id: string,
        @Body() dto: RequestUpdateSchoolDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.schoolsService.update(id, dto, director.profile.id);
    }

    @Delete(":id")
    @Roles(["DIRECTOR"])
    async remove(
        @Param("id") id: string,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.schoolsService.remove(id, director.profile.id);
    }

    @Get("/count")
    @Roles(["DIRECTOR"])
    async count(@UserAuth() director: UserWithProfile) {
        return this.schoolsService.count(director.profile.id);
    }
}
