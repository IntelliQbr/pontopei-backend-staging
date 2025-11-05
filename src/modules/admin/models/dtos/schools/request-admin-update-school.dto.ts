import { IsNotEmpty, IsString } from "class-validator";
import { RequestUpdateSchoolDto } from "src/modules/schools/models/dtos/update/request-update.dto";

export class RequestAdminUpdateSchoolDto extends RequestUpdateSchoolDto {
    @IsNotEmpty({ message: "ID do diretor é obrigatório." })
    @IsString({ message: "ID do diretor deve ser uma string." })
    directorId: string;
}
