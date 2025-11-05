import { StudentGender } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";

export class RequestCreateStudentDto {
    @IsString({ message: "O nome completo deve ser uma string" })
    @IsNotEmpty({ message: "O nome completo é obrigatório" })
    fullName: string;

    @IsString({ message: "A URL da foto deve ser uma string" })
    @IsOptional()
    photoUrl?: string;

    @IsEnum(StudentGender, { message: "O gênero deve ser um enum válido" })
    @IsNotEmpty({ message: "O gênero é obrigatório" })
    gender: StudentGender;

    @IsDateString(
        {},
        { message: "A data de nascimento deve ser uma data válida" },
    )
    dateOfBirth: Date;

    @IsString({ message: "As necessidades especiais devem ser uma string" })
    @IsNotEmpty({ message: "As necessidades especiais são obrigatórias" })
    specialNeeds: string;

    @IsArray({ message: "As condições médicas devem ser um array" })
    @ValidateNested({ each: true })
    @Type(() => MedicalConditionDto)
    @IsOptional()
    medicalConditions?: MedicalConditionDto[];

    @IsBoolean({ message: "O campo camping deve ser um booleano" })
    hasCamping: boolean = false;

    @IsString({ message: "O nome do responsável deve ser uma string" })
    @IsNotEmpty({ message: "O nome do responsável é obrigatório" })
    parentGuardian: string;

    @IsString({ message: "O CID deve ser uma string" })
    @IsOptional()
    cid?: string;

    @IsString({ message: "O ID da turma deve ser uma string" })
    @IsNotEmpty({ message: "O ID da turma é obrigatório" })
    classroomId: string;
}

export class MedicalConditionDto {
    @IsString({ message: "O diagnóstico deve ser uma string" })
    @IsNotEmpty({ message: "O diagnóstico é obrigatório" })
    condition: string;

    @IsString({ message: "A idade deve ser uma string" })
    @IsOptional()
    age: string;
}
