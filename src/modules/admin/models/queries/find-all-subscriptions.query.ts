import { SubscriptionStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { FindAllQuery } from "src/core/models/find-all-query";

export class FindAllSubscriptionsQuery extends FindAllQuery {
    @IsEnum(SubscriptionStatus, {
        message: "O status deve ser um enum válido.",
    })
    @IsOptional()
    status?: SubscriptionStatus;
}
