import { SubscriptionPlan } from "@prisma/client";
import { IsEnum } from "class-validator";

export class RequestSubscribePlanDto {
    @IsEnum(SubscriptionPlan, {
        message: "O plano deve ser válido.",
    })
    planType: Exclude<SubscriptionPlan, "PLUS">;
}
