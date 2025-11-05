import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ProfileRole } from "@prisma/client";
import { FindAllQuery } from "src/core/models/find-all-query";
import { SubscriptionGuard } from "src/modules/subscriptions/guards/subscription.guard";
import { UserWithProfile } from "../../../core/models/user-with-profile.model";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserAuth } from "../../auth/decorators/user-auth.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { RequestCreateClassroomDto } from "../models/dtos/create/request-create-classroom.dto";
import { RequestUpdateClassroomDto } from "../models/dtos/update/request-update-classroom.dto";
import { ClassroomsService } from "../services/classrooms.service";

@Controller("/classrooms")
@UseGuards(AuthGuard, RolesGuard)
export class ClassroomsController {
    constructor(private readonly classroomsService: ClassroomsService) {}

    @Post()
    @Roles([ProfileRole.DIRECTOR])
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(SubscriptionGuard)
    async create(
        @Body() dto: RequestCreateClassroomDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return await this.classroomsService.create(dto, director.profile.id);
    }

    @Get()
    @Roles([ProfileRole.DIRECTOR, ProfileRole.TEACHER])
    @HttpCode(HttpStatus.OK)
    async findAllToDirector(
        @Query() query: FindAllQuery,
        @UserAuth() user: UserWithProfile,
    ) {
        return await this.classroomsService.findAllToDirector(
            query,
            user.profile.createdById || user.profile.id,
        );
    }

    @Put(":id")
    @Roles([ProfileRole.DIRECTOR])
    @HttpCode(HttpStatus.OK)
    async update(
        @Param("id") id: string,
        @Body() dto: RequestUpdateClassroomDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return await this.classroomsService.update(
            id,
            dto,
            director.profile.id,
        );
    }

    @Delete(":id")
    @Roles([ProfileRole.DIRECTOR])
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param("id") id: string,
        @UserAuth() director: UserWithProfile,
    ) {
        await this.classroomsService.remove(id, director.profile.id);
    }

    @Get("/count")
    @Roles([ProfileRole.DIRECTOR])
    async count(@UserAuth() director: UserWithProfile) {
        return await this.classroomsService.count(director.profile.id);
    }
}
