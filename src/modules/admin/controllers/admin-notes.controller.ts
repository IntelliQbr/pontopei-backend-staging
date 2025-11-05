import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { FindAllQuery } from "src/core/models/find-all-query";
import { AdminGuard } from "../guards/admin.guard";
import { AdminNotesService } from "../services/admin-notes.service";

@Controller("/admin/notes")
@UseGuards(AdminGuard)
export class AdminNotesController {
    constructor(private readonly adminNotesService: AdminNotesService) {}

    @Get("/student/:studentId")
    async findAllByStudentId(
        @Param("studentId") studentId: string,
        @Query() query: FindAllQuery,
    ) {
        return this.adminNotesService.findAllByStudentId(studentId, query);
    }
}
