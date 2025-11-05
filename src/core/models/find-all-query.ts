import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindAllQuery {
    @Transform(({ value }) => Number(value))
    @IsNumber(
        { allowNaN: false, allowInfinity: false },
        { message: "O campo skip deve ser um número" },
    )
    @IsOptional()
    skip?: number = 0;

    @Transform(({ value }) => Number(value))
    @IsNumber(
        { allowNaN: false, allowInfinity: false },
        { message: "O campo take deve ser um número" },
    )
    @IsOptional()
    take?: number = 10;

    @IsString({ message: "O campo de busca deve ser uma string" })
    @IsOptional()
    search?: string;
}
