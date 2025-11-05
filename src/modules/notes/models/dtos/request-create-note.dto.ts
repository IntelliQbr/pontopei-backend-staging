import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RequestCreateNoteDto {
    @IsNotEmpty({ message: "Conteúdo não pode ser vazio" })
    @IsString({ message: "Conteúdo deve ser uma string" })
    @MaxLength(1000, { message: "Conteúdo deve ter no máximo 1000 caracteres" })
    content: string;

    @IsNotEmpty({ message: "ID do aluno não pode ser vazio" })
    @IsString({ message: "ID do aluno deve ser uma string" })
    studentId: string;
}
