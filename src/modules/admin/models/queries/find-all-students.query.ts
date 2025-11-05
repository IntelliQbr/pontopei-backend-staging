import { ClassPeriod, StudentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { FindAllQuery } from "src/core/models/find-all-query";

export class FindAllStudentsQuery extends FindAllQuery {
    @IsEnum(ClassPeriod, {
        message: "O período da turma deve ser um valor válido",
    })
    @IsOptional()
    classPeriod?: ClassPeriod;

    @IsEnum(StudentStatus, {
        message: "O status do aluno deve ser um valor válido",
    })
    @IsOptional()
    status?: StudentStatus;

    @IsString({
        message: "O ID da turma deve ser uma string",
    })
    @IsOptional()
    classroomId?: string;

    @IsString({
        message: "O ID do diretor deve ser uma string",
    })
    @IsOptional()
    directorId?: string;

    @IsString({
        message: "O ID da escola deve ser uma string",
    })
    @IsOptional()
    schoolId?: string;

    @IsString({
        message: "O ID do professor deve ser uma string",
    })
    @IsOptional()
    teacherId?: string;
}
