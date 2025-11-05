import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

export class CreateTeacherDto {
    @IsString({ message: "O nome completo deve ser uma string." })
    @IsNotEmpty({ message: "O nome completo não pode estar vazio." })
    fullName: string;

    @IsEmail({}, { message: "O email fornecido não é válido." })
    @IsNotEmpty({ message: "O email não pode estar vazio." })
    email: string;

    @IsString({ message: "A senha deve ser uma string." })
    @IsNotEmpty({ message: "A senha não pode estar vazia." })
    @MinLength(8, { message: "A senha deve ter no mínimo 8 caracteres." })
    @MaxLength(20, { message: "A senha deve ter no máximo 20 caracteres." })
    password: string;

    @IsNotEmpty({ message: "O ID da escola não pode estar vazio." })
    schoolId: string;

    @IsOptional({ message: "O avatar deve ser uma string." })
    avatarUrl?: string;
}
