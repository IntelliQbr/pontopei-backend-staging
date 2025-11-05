import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RequestSignUpDto {
    @IsString({ message: "O nome deve ser uma string." })
    @MaxLength(100, { message: "O nome deve ter no máximo 100 caracteres." })
    @MinLength(3, { message: "O nome deve ter no mínimo 3 caracteres." })
    fullName: string;

    @IsString({ message: "O email deve ser uma string." })
    @IsEmail(undefined, { message: "O email deve ser valido." })
    email: string;

    @IsString({ message: "A senha deve ser uma string." })
    @MinLength(8, { message: "A senha deve ter no mínimo 8 caracteres." })
    @MaxLength(20, { message: "A senha deve ter no máximo 20 caracteres." })
    password: string;

    @IsString({ message: "A confirmação de senha deve ser uma string." })
    @MinLength(8, {
        message: "A confirmação de senha deve ter no mínimo 8 caracteres.",
    })
    @MaxLength(20, {
        message: "A confirmação de senha deve ter no máximo 20 caracteres.",
    })
    confirmPassword: string;
}
