import { IsDateString, IsNotEmpty, IsObject, IsString } from "class-validator";

export class RequestCreateWeeklyPlanDto {
    @IsNotEmpty({ message: "O ID do aluno é obrigatório" })
    @IsString({ message: "O ID do aluno deve ser uma string" })
    studentId: string;

    @IsNotEmpty({ message: "A data de início da semana é obrigatória" })
    @IsDateString(
        {},
        {
            message: "A data de início da semana deve ser uma data válida",
        },
    )
    weekStart: string;

    @IsNotEmpty({ message: "A data de fim da semana é obrigatória" })
    @IsDateString(
        {},
        {
            message: "A data de fim da semana deve ser uma data válida",
        },
    )
    weekEnd: string;

    @IsObject({ message: "As atividades devem ser um objeto" })
    @IsNotEmpty({ message: "As atividades são obrigatórias" })
    weekActivities: Record<string, ActivityDto[]>;

    @IsObject({ message: "As perguntas devem ser um objeto" })
    @IsNotEmpty({ message: "As perguntas são obrigatórias" })
    formQuestions: Record<string, string>;
}

export class ActivityDto {
    @IsNotEmpty({ message: "A matéria é obrigatória" })
    @IsString({ message: "A matéria deve ser uma string" })
    subject: string;

    @IsNotEmpty({ message: "O horário é obrigatório" })
    @IsString({ message: "O horário deve ser uma string" })
    time: string;

    @IsNotEmpty({ message: "O conteúdo é obrigatório" })
    @IsString({ message: "O conteúdo deve ser uma string" })
    content: string;
}
