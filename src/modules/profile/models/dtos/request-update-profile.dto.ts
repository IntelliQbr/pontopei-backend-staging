import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RequestUpdateProfileDto {
    @IsString({ message: "Nome completo é obrigatório" })
    @IsNotEmpty({ message: "Nome completo é obrigatório" })
    fullName: string;

    @IsEmail({}, { message: "Email inválido" })
    @IsNotEmpty({ message: "Email é obrigatório" })
    email: string;

    @IsString({ message: "URL do avatar é obrigatória" })
    @IsOptional({ message: "URL do avatar é opcional" })
    avatarUrl?: string;
}
