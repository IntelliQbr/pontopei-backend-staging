import { OmitType } from "@nestjs/mapped-types";
import { ProfileRole } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { RequestSignUpDto } from "src/modules/auth/models/dtos/sign-up/request-sign-up.dto";

export class RequestCreateUserDto extends OmitType(RequestSignUpDto, [
    "confirmPassword",
]) {
    @IsEnum(ProfileRole, { message: "A função deve ser uma função válida." })
    @IsNotEmpty({ message: "A função é obrigatória." })
    role: ProfileRole;

    @IsString({ message: "O ID do diretor deve ser uma string." })
    @IsNotEmpty({ message: "O ID da escola é obrigatório." })
    @ValidateIf(
        (dto: RequestCreateUserDto) => dto.role === ProfileRole.TEACHER,
        {
            message: "O ID do diretor é obrigatório.",
        },
    )
    directorId?: string;

    @IsString({ message: "O ID da escola deve ser uma string." })
    @IsNotEmpty({ message: "O ID da escola é obrigatório." })
    @ValidateIf(
        (dto: RequestCreateUserDto) => dto.role === ProfileRole.TEACHER,
        {
            message: "O ID da escola é obrigatório.",
        },
    )
    schoolId?: string;
}
