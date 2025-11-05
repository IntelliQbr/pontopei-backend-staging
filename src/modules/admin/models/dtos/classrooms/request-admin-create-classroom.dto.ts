import { IsNotEmpty, IsString } from "class-validator";
import { RequestCreateClassroomDto } from "src/modules/classrooms/models/dtos/create/request-create-classroom.dto";

export class RequestAdminCreateClassroomDto extends RequestCreateClassroomDto {
    @IsNotEmpty({ message: "ID do diretor é obrigatório." })
    @IsString({ message: "ID do diretor deve ser uma string." })
    directorId: string;
}
