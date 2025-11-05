import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class RequestCreatePEIDto {
    @IsString({ message: "O ID do aluno deve ser uma string" })
    @IsNotEmpty({ message: "O ID do aluno é obrigatório" })
    studentId: string;

    @IsObject({ message: "As perguntas devem ser um objeto" })
    @IsNotEmpty({ message: "As perguntas são obrigatórias" })
    formQuestions: Record<string, any>;

    @IsOptional()
    @IsObject({ message: "O segundo formulário deve ser um objeto" })
    secondFormQuestions?: Record<string, any>;
}
