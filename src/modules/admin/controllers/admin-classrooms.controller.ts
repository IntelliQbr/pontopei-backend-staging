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
import { FindAllQuery } from "src/core/models/find-all-query";
import { AdminGuard } from "../guards/admin.guard";
import { RequestAdminCreateClassroomDto } from "../models/dtos/classrooms/request-admin-create-classroom.dto";
import { RequestAdminUpdateClassroomDto } from "../models/dtos/classrooms/request-admin-update-classroom.dto";
import { AdminClassroomsService } from "../services/admin-classrooms.service";

@Controller("/admin/classrooms")
@UseGuards(AdminGuard)
export class AdminClassroomsController {
    constructor(
        private readonly adminClassroomsService: AdminClassroomsService,
    ) {}

    @Get()
    async findAllClassrooms(@Query() query: FindAllQuery) {
        return this.adminClassroomsService.findAllClassrooms(query);
    }

    @Get("/:directorId")
    async findAllClassroomsByDirectorId(
        @Param("directorId") directorId: string,
        @Query() query: FindAllQuery,
    ) {
        return this.adminClassroomsService.findAllClassroomsByDirectorId(
            query,
            directorId,
        );
    }

    @Post()
    async createClassroom(@Body() dto: RequestAdminCreateClassroomDto) {
        return this.adminClassroomsService.createClassroom(dto);
    }

    @Put("/:id")
    async updateClassroom(
        @Param("id") id: string,
        @Body() dto: RequestAdminUpdateClassroomDto,
    ) {
        return this.adminClassroomsService.updateClassroom(id, dto);
    }

    @Delete("/:id")
    async removeClassroom(@Param("id") id: string) {
        return this.adminClassroomsService.removeClassroom(id);
    }
}
