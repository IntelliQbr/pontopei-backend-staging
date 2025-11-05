import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { FindAllQuery } from "src/core/models/find-all-query";
import { AdminGuard } from "../guards/admin.guard";
import { AdminTeachersService } from "../services/admin-teachers.service";

@Controller("/admin/teachers")
@UseGuards(AdminGuard)
export class AdminTeachersController {
    constructor(private readonly adminTeachersService: AdminTeachersService) {}

    @Get("/:directorId")
    async findAllTeachersByDirectorId(
        @Query() query: FindAllQuery,
        @Param("directorId") directorId: string,
    ) {
        return this.adminTeachersService.findAllTeachersByDirectorId(
            query,
            directorId,
        );
    }
}
