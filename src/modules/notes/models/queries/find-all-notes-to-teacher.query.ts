import { OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";
import { FindAllQuery } from "src/core/models/find-all-query";

export class FindAllNotesToTeacherQuery extends OmitType(FindAllQuery, [
    "search",
]) {
    @IsNotEmpty({ message: "ID do aluno não pode ser vazio" })
    @IsString({ message: "ID do aluno deve ser uma string" })
    studentId: string;
}
