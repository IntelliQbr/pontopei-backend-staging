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
import { RequestAdminCreateSchoolDto } from "../models/dtos/schools/request-admin-create-school.dto";
import { RequestAdminUpdateSchoolDto } from "../models/dtos/schools/request-admin-update-school.dto";
import { AdminSchoolsService } from "../services/admin-schools.service";

@Controller("/admin/schools")
@UseGuards(AdminGuard)
export class AdminSchoolsController {
    constructor(private readonly adminSchoolsService: AdminSchoolsService) {}

    @Get()
    async findAllSchools(@Query() query: FindAllQuery) {
        return this.adminSchoolsService.findAllSchools(query);
    }

    @Get("/:directorId")
    async findAllSchoolsByDirectorId(
        @Param("directorId") directorId: string,
        @Query() query: FindAllQuery,
    ) {
        return this.adminSchoolsService.findAllSchoolsByDirectorId(
            query,
            directorId,
        );
    }

    @Post()
    async createSchool(@Body() dto: RequestAdminCreateSchoolDto) {
        return this.adminSchoolsService.createSchool(dto);
    }

    @Put("/:id")
    async updateSchool(
        @Param("id") id: string,
        @Body() dto: RequestAdminUpdateSchoolDto,
    ) {
        return this.adminSchoolsService.updateSchool(id, dto);
    }

    @Delete("/:id")
    async removeSchool(@Param("id") id: string) {
        return this.adminSchoolsService.removeSchool(id);
    }
}
