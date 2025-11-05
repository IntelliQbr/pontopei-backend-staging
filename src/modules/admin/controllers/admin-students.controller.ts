import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { RequestUpdateStudentDto } from "../../students/models/dtos/update/request-update-student.dto";
import { AdminGuard } from "../guards/admin.guard";
import { FindAllStudentsQuery } from "../models/queries/find-all-students.query";
import { AdminStudentsService } from "../services/admin-students.service";

@Controller("/admin/students")
@UseGuards(AdminGuard)
export class AdminStudentsController {
    constructor(private readonly adminStudentsService: AdminStudentsService) {}

    @Get()
    async findAllStudents(@Query() query: FindAllStudentsQuery) {
        return this.adminStudentsService.findAllStudents(query);
    }

    @Get(":id")
    async findOneStudent(@Param("id") id: string) {
        return this.adminStudentsService.findOneStudent(id);
    }

    @Put(":id")
    async updateStudent(
        @Param("id") id: string,
        @Body() dto: RequestUpdateStudentDto,
    ) {
        return this.adminStudentsService.updateStudent(id, dto);
    }

    @Delete(":id")
    async removeStudent(@Param("id") id: string) {
        return this.adminStudentsService.removeStudent(id);
    }
}
