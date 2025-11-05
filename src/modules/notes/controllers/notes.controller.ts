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
import { RequestCreateNoteDto } from "../models/dtos/request-create-note.dto";
import { FindAllNotesToDirectorQuery } from "../models/queries/find-all-notes-to-director.query";
import { FindAllNotesToTeacherQuery } from "../models/queries/find-all-notes-to-teacher.query";
import { NotesService } from "../services/notes.service";

@Controller("/notes")
@UseGuards(AuthGuard, RolesGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post()
    @Roles(["TEACHER"])
    async createNote(
        @Body() dto: RequestCreateNoteDto,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.notesService.createNote(dto, teacher.profile.id);
    }

    @Get("/teacher")
    @Roles(["TEACHER"])
    async findAllTeacher(
        @Query() query: FindAllNotesToTeacherQuery,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.notesService.findAllToTeacher(query, teacher.profile.id);
    }

    @Get("/director")
    @Roles(["DIRECTOR"])
    async findAllDirector(
        @Query() query: FindAllNotesToDirectorQuery,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.notesService.findAllToDirector(query, director.profile.id);
    }

    @Get("/teacher/latest-notes")
    @Roles(["TEACHER"])
    async latestsNotesToTeacher(@UserAuth() teacher: UserWithProfile) {
        return this.notesService.latestsNotesToTeacher(teacher.profile.id);
    }

    @Get("/student/:studentId")
    @Roles(["DIRECTOR", "TEACHER"])
    async findAllByStudentId(
        @Param("studentId") studentId: string,
        @Query() query: FindAllQuery,
        @UserAuth() user: UserWithProfile,
    ) {
        return this.notesService.findAllByStudentId(
            studentId,
            user.profile.createdById ?? user.profile.id,
            query,
        );
    }
}
