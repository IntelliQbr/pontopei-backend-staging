import { ClassPeriod } from "@prisma/client";
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class RequestCreateClassroomDto {
    @IsNotEmpty({
        message: "O nome da turma não pode ser vazio",
    })
    @IsString({
        message: "O nome da turma deve ser uma string",
    })
    name: string;

    @IsNotEmpty({
        message: "A série não pode ser vazia",
    })
    @IsString({
        message: "A série deve ser uma string",
    })
    grade: string;

    @IsNotEmpty({
        message: "O período não pode ser vazio",
    })
    @IsEnum(ClassPeriod, {
        message: "O período informado não é válido.",
    })
    period: ClassPeriod;

    @IsOptional()
    @IsInt({
        message: "A capacidade deve ser um número inteiro",
    })
    capacity?: number;

    @IsNotEmpty({
        message: "O ID da escola não pode ser vazio",
    })
    schoolId: string;
}
