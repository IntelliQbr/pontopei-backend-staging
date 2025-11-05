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
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { StudentLimitsGuard } from "src/modules/students/guards/student-limits.guard";
import { RequestCreateStudentDto } from "../models/dtos/create/request-create-student.dto";
import { RequestUpdateStudentDto } from "../models/dtos/update/request-update-student.dto";
import { FindAllStudentsToDirectorQuery } from "../models/queries/find-all/find-all-students-to-director.query";
import { FindAllStudentsToTeacherQuery } from "../models/queries/find-all/find-all-students-to-teacher.query";
import { StudentsService } from "../services/students.service";

@Controller("/students")
@UseGuards(AuthGuard, RolesGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Post()
    @Roles(["TEACHER"])
    @UseGuards(StudentLimitsGuard)
    async create(
        @Body() dto: RequestCreateStudentDto,
        @UserAuth() user: UserWithProfile,
    ) {
        return this.studentsService.create(dto, user.profile.id);
    }

    @Get("/teacher")
    @Roles(["TEACHER"])
    async findAllToTeacher(
        @Query() query: FindAllStudentsToTeacherQuery,
        @UserAuth() teacher: UserWithProfile,
    ) {
        return this.studentsService.findAllToTeacher(query, teacher.profile.id);
    }

    @Get("/director")
    @Roles(["DIRECTOR"])
    async findAllToDirector(
        @Query() query: FindAllStudentsToDirectorQuery,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.studentsService.findAllToDirector(
            query,
            director.profile.id,
        );
    }

    @Get(":id")
    async findOne(@Param("id") id: string, @UserAuth() user: UserWithProfile) {
        return this.studentsService.findOne(
            id,
            user.profile.createdById ?? user.profile.id,
        );
    }

    @Get("/teacher/count")
    @Roles(["TEACHER"])
    async count(@UserAuth() teacher: UserWithProfile) {
        return this.studentsService.count(teacher.profile.id);
    }

    @Put(":id")
    @Roles(["DIRECTOR"])
    async update(
        @Param("id") id: string,
        @Body() dto: RequestUpdateStudentDto,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.studentsService.update(dto, id, director.profile.id);
    }

    @Delete(":id")
    @Roles(["DIRECTOR"])
    async remove(
        @Param("id") id: string,
        @UserAuth() director: UserWithProfile,
    ) {
        return this.studentsService.remove(id, director.profile.id);
    }
}
