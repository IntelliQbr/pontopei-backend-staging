import { OmitType } from "@nestjs/mapped-types";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { RequestCreateUserDto } from "./request-create-user.dto";

export class RequestUpdateUserDto extends OmitType(RequestCreateUserDto, [
    "password",
]) {
    @IsString({ message: "A senha deve ser uma string." })
    @MinLength(8, { message: "A senha deve ter no mínimo 8 caracteres." })
    @MaxLength(20, { message: "A senha deve ter no máximo 20 caracteres." })
    @IsOptional()
    password?: string;
}
