import { IsBoolean, IsNotEmpty } from "class-validator";

export class RequestSetAdminDto {
    @IsBoolean({ message: "O campo isAdmin deve ser um booleano." })
    @IsNotEmpty({ message: "O campo isAdmin é obrigatório." })
    isAdmin: boolean;
}
