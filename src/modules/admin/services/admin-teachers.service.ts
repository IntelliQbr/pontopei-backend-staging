import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { FindAllQuery } from "src/core/models/find-all-query";
import { TeachersService } from "src/modules/teachers/services/teachers.service";

@Injectable()
export class AdminTeachersService {
    constructor(private teachersService: TeachersService) {}

    async findAllTeachersByDirectorId(
        query: FindAllQuery,
        directorId: string,
    ): Promise<{ teachers: User[]; total: number }> {
        return this.teachersService.findAll(query, directorId);
    }
}
