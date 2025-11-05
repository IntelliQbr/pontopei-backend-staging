import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { FindAllQuery } from "src/core/models/find-all-query";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { WeeklyPlansLimitsGuard } from "../guards/weekly-plans-limits.guard";
import { RequestCreateWeeklyPlanDto } from "../models/dtos/create/request-create-weekly-plan.dto";
import { WeeklyPlansService } from "../services/weekly-plans.service";

@Controller("/weekly-plans")
@UseGuards(AuthGuard, RolesGuard)
export class WeeklyPlansController {
    constructor(private readonly weeklyPlansService: WeeklyPlansService) {}

    @Post()
    @Roles(["TEACHER"])
    @UseGuards(WeeklyPlansLimitsGuard)
    async create(
        @Body() dto: RequestCreateWeeklyPlanDto,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.weeklyPlansService.create(dto, teacher.profile.id);
    }

    @Get("/teacher/count")
    @Roles(["TEACHER"])
    async countToTeacher(@UserAuth() teacher: UserWithProfile) {
        return this.weeklyPlansService.countToTeacher(teacher.profile.id);
    }

    @Get("/student/:studentId")
    @Roles(["DIRECTOR", "TEACHER"])
    async findAllByStudentId(
        @Param("studentId") studentId: string,
        @Query() query: FindAllQuery,
        @UserAuth() user: UserWithProfile,
    ) {
        return this.weeklyPlansService.findAllByStudentId(
            studentId,
            user.profile.createdById ?? user.profile.id,
            query,
        );
    }
}
