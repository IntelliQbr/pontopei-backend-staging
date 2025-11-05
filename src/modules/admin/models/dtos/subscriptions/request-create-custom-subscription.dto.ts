import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";

export class SubscriptionLimitDto {
    @IsInt({
        message: "O número máximo de estudantes deve ser um número inteiro.",
    })
    @Min(1, { message: "O número máximo de estudantes deve ser pelo menos 1." })
    maxStudents: number;

    @IsInt({
        message:
            "O número máximo de PEIs por trimestre deve ser um número inteiro.",
    })
    @Min(1, {
        message: "O número máximo de PEIs por trimestre deve ser pelo menos 1.",
    })
    maxPeiPerTrimester: number;

    @IsInt({
        message:
            "O número máximo de planos semanais deve ser um número inteiro.",
    })
    @Min(1, {
        message: "O número máximo de planos semanais deve ser pelo menos 1.",
    })
    maxWeeklyPlans: number;
}

export class SubscriptionFeatureDto {
    @IsBoolean({ message: "O suporte premium deve ser um booleano." })
    premiumSupport: boolean;
}

export class RequestCreateCustomSubscriptionDto {
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: "O preço deve ser um número." },
    )
    @Min(0.5, { message: "O preço deve ser maior que R$0.50." })
    price: number;

    @ValidateNested()
    @Type(() => SubscriptionLimitDto)
    @IsNotEmptyObject(
        {},
        {
            message: "Os limites devem ser um objeto não vazio.",
        },
    )
    limits: SubscriptionLimitDto;

    @ValidateNested()
    @Type(() => SubscriptionFeatureDto)
    @IsNotEmptyObject(
        {},
        {
            message: "As features devem ser um objeto não vazio.",
        },
    )
    features: SubscriptionFeatureDto;

    @IsDateString(
        { strict: true },
        {
            message:
                "A data de início da recorrência deve ser uma data válida.",
        },
    )
    startDate: Date;

    @IsDateString(
        { strict: true },
        {
            message:
                "A data de término da recorrência deve ser uma data válida.",
        },
    )
    endDate: Date;

    @IsBoolean({ message: "A assinatura deve ser ativada automaticamente." })
    @IsOptional()
    enableSubscriptionNow: boolean = true;

    @IsNumber({}, { message: "A frequência deve ser um número." })
    @IsNotEmpty({ message: "A frequência é obrigatória." })
    frequency: number;

    @IsEnum(["day", "month"], {
        message:
            "O tipo de frequência deve ser um dos seguintes valores: day, month.",
    })
    @IsNotEmpty({ message: "O tipo de frequência é obrigatório." })
    frequencyType: "day" | "month";

    @IsString({ message: "O ID do diretor deve ser uma string." })
    @IsNotEmpty({ message: "O ID do diretor é obrigatório." })
    directorId: string;
}
