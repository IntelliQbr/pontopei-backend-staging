import { IsNotEmpty, IsString } from "class-validator";
import { RequestUpdateClassroomDto } from "src/modules/classrooms/models/dtos/update/request-update-classroom.dto";

export class RequestAdminUpdateClassroomDto extends RequestUpdateClassroomDto {
    @IsNotEmpty({ message: "ID do diretor é obrigatório." })
    @IsString({ message: "ID do diretor deve ser uma string." })
    directorId: string;

    @IsNotEmpty({
        message: "O ID da escola não pode ser vazio",
    })
    @IsString({ message: "ID da escola deve ser uma string." })
    schoolId: string;
}
