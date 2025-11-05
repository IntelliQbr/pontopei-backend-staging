import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { PeiPerTrimesterLimitsGuard } from "../guards/pei-per-trimester-limits.guard";
import { RequestCreatePEIDto } from "../models/create/request-create-pei.dto";
import { PEIService } from "../services/pei.service";

@Controller("/pei")
@UseGuards(AuthGuard, RolesGuard)
export class PEIController {
    constructor(private readonly peiService: PEIService) {}

    @Post()
    @Roles(["TEACHER"])
    @UseGuards(PeiPerTrimesterLimitsGuard)
    async createPEI(
        @Body() dto: RequestCreatePEIDto,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.peiService.createPEI(dto, teacher.profile.id);
    }

    @Post("/renew")
    @Roles(["TEACHER"])
    @UseGuards(PeiPerTrimesterLimitsGuard)
    async renewPEI(
        @Body() dto: RequestCreatePEIDto,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.peiService.renewPEI(dto, teacher.profile.id);
    }

    @Get("/director/active-count")
    @Roles(["DIRECTOR"])
    async activePEIsCountToDirector(@UserAuth() director: UserWithProfile) {
        return this.peiService.activePEIsCountToDirector(director.profile.id);
    }

    @Get("/teacher/active-count")
    @Roles(["TEACHER"])
    async activePEIsCountToTeacher(@UserAuth() teacher: UserWithProfile) {
        return this.peiService.activePEIsCountToTeacher(teacher.profile.id);
    }

    @Get("/director/expiring-count")
    @Roles(["DIRECTOR"])
    async expiringPEIsCountToDirector(@UserAuth() director: UserWithProfile) {
        return this.peiService.expiringPEIsCountToDirector(director.profile.id);
    }

    @Get("/teacher/expiring-count")
    @Roles(["TEACHER"])
    async expiringPEIsCountToTeacher(@UserAuth() teacher: UserWithProfile) {
        return this.peiService.expiringPEIsCountToTeacher(teacher.profile.id);
    }

    @Get("/director/latest-peis")
    @Roles(["DIRECTOR"])
    async latestsPEIsToDirector(@UserAuth() director: UserWithProfile) {
        return this.peiService.latestsPEIsToDirector(director.profile.id);
    }

    @Get("/teacher/latest-peis")
    @Roles(["TEACHER"])
    async latestsPEIsToTeacher(@UserAuth() teacher: UserWithProfile) {
        return this.peiService.latestsPEIsToTeacher(teacher.profile.id);
    }

    @Get("/teacher/latest-pei/:studentId")
    @Roles(["TEACHER"])
    async latestPEIByStudentId(
        @UserAuth() teacher: UserWithProfile,
        @Param("studentId") studentId: string,
    ) {
        return this.peiService.findLatestPEIByStudentId(
            studentId,
            teacher.profile.id,
        );
    }
}
