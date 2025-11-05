import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsEnum,
    IsNotEmptyObject,
    IsNumber,
    Min,
    ValidateNested,
} from "class-validator";
import {
    SubscriptionFeatureDto,
    SubscriptionLimitDto,
} from "./request-create-custom-subscription.dto";

export class RequestUpdateSubscriptionDto {
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: "O preço deve ser um número." },
    )
    @Min(0.5, { message: "O preço deve ser maior que R$0.50." })
    price: number;

    @IsEnum(SubscriptionStatus, {
        message: "O status deve ser válido.",
    })
    status: SubscriptionStatus;

    @IsEnum(SubscriptionPlan, {
        message: "O tipo de plano deve ser válido.",
    })
    planType: SubscriptionPlan;

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
}
