import { ClassPeriod } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class RequestUpdateClassroomDto {
    @IsOptional()
    @IsString({
        message: "O nome da turma deve ser uma string",
    })
    name?: string;

    @IsOptional()
    @IsString({
        message: "A série deve ser uma string",
    })
    grade?: string;

    @IsOptional()
    @IsEnum(ClassPeriod, {
        message: "O período informado não é válido.",
    })
    period?: ClassPeriod;

    @IsOptional()
    @IsInt({
        message: "A capacidade deve ser um número inteiro",
    })
    capacity?: number;
}
