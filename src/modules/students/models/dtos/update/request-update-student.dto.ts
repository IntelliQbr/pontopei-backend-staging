import { IsNotEmpty, IsString } from "class-validator";
import { RequestCreateStudentDto } from "src/modules/students/models/dtos/create/request-create-student.dto";

export class RequestUpdateStudentDto extends RequestCreateStudentDto {
    @IsString({ message: "O ID do professor deve ser uma string" })
    @IsNotEmpty({ message: "O ID do professor é obrigatório" })
    teacherId: string;
}
