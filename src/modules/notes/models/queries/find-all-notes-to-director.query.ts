import { IsNotEmpty, IsString } from "class-validator";
import { FindAllNotesToTeacherQuery } from "./find-all-notes-to-teacher.query";

export class FindAllNotesToDirectorQuery extends FindAllNotesToTeacherQuery {
    @IsNotEmpty({ message: "ID do professor não pode ser vazio" })
    @IsString({ message: "ID do professor deve ser uma string" })
    teacherId: string;
}
