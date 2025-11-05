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
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { SubscriptionGuard } from "src/modules/subscriptions/guards/subscription.guard";
import { CreateTeacherDto } from "../models/dtos/create/request-create-teacher.dto";
import { UpdateTeacherDto } from "../models/dtos/update/request-update-teacher.dto";
import { TeachersService } from "../services/teachers.service";

@Controller("/teachers")
@UseGuards(AuthGuard, RolesGuard)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) {}

    @Post()
    @Roles([ProfileRole.DIRECTOR])
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(SubscriptionGuard)
    create(
        @Body() createTeacherDto: CreateTeacherDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.teachersService.create(
            createTeacherDto,
            director.profile.id,
        );
    }

    @Get()
    @Roles([ProfileRole.DIRECTOR])
    findAll(
        @Query() query: FindAllQuery,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.teachersService.findAll(query, director.profile.id);
    }

    @Put(":id")
    @Roles([ProfileRole.DIRECTOR])
    update(
        @Param("id") id: string,
        @Body() updateTeacherDto: UpdateTeacherDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.teachersService.update(
            id,
            updateTeacherDto,
            director.profile.id,
        );
    }

    @Delete(":id")
    @Roles([ProfileRole.DIRECTOR])
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param("id") id: string, @UserAuth() director: UserWithProfile) {
        return this.teachersService.remove(id, director.profile.id);
    }
}
