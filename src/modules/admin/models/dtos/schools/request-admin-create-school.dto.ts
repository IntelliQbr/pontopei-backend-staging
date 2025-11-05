import { IsNotEmpty, IsString } from "class-validator";
import { RequestCreateSchoolDto } from "src/modules/schools/models/dtos/create/request-create.dto";

export class RequestAdminCreateSchoolDto extends RequestCreateSchoolDto {
    @IsNotEmpty({ message: "ID do diretor é obrigatório." })
    @IsString({ message: "ID do diretor deve ser uma string." })
    directorId: string;
}
