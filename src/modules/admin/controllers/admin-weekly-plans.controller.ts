import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { FindAllQuery } from "src/core/models/find-all-query";
import { AdminGuard } from "../guards/admin.guard";
import { AdminWeeklyPlansService } from "../services/admin-weekly-plans.service";

@Controller("/admin/weekly-plans")
@UseGuards(AdminGuard)
export class AdminWeeklyPlansController {
    constructor(
        private readonly adminWeeklyPlansService: AdminWeeklyPlansService,
    ) {}

    @Get("/student/:studentId")
    async findAllByStudentId(
        @Param("studentId") studentId: string,
        @Query() query: FindAllQuery,
    ) {
        return this.adminWeeklyPlansService.findAllByStudentId(
            studentId,
            query,
        );
    }
}
