import { IsNotEmpty, IsString } from "class-validator";

export class RequestCreateSchoolDto {
    @IsNotEmpty({ message: "Nome da escola é obrigatório." })
    @IsString({ message: "Nome da escola deve ser uma string." })
    name: string;

    @IsNotEmpty({ message: "Endereço da escola é obrigatório." })
    @IsString({ message: "Endereço da escola deve ser uma string." })
    address: string;
}
