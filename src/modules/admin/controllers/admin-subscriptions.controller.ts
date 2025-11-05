import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../guards/admin.guard";
import { RequestCreateCustomSubscriptionDto } from "../models/dtos/subscriptions/request-create-custom-subscription.dto";
import { RequestUpdateSubscriptionDto } from "../models/dtos/subscriptions/request-update-subscription.dto";
import { FindAllSubscriptionsQuery } from "../models/queries/find-all-subscriptions.query";
import { AdminSubscriptionsService } from "../services/admin-subscriptions.service";

@Controller("/admin/subscriptions")
@UseGuards(AdminGuard)
export class AdminSubscriptionsController {
    constructor(
        private readonly adminSubscriptionsService: AdminSubscriptionsService,
    ) {}

    @Post()
    async createCustomSubscription(
        @Body() dto: RequestCreateCustomSubscriptionDto,
    ) {
        return this.adminSubscriptionsService.createCustomSubscription(dto);
    }

    @Get()
    async findAllSubscriptions(@Query() query: FindAllSubscriptionsQuery) {
        return this.adminSubscriptionsService.findAllSubscriptions(query);
    }

    @Delete("/:subscriptionId")
    async removeSubscription(@Param("subscriptionId") subscriptionId: string) {
        return this.adminSubscriptionsService.removeSubscription(
            subscriptionId,
        );
    }

    @Get("/current-limits/:directorId")
    async findSubscriptionLimits(@Param("directorId") directorId: string) {
        return this.adminSubscriptionsService.findSubscriptionLimits(
            directorId,
        );
    }

    @Put("/:subscriptionId")
    async updateSubscription(
        @Param("subscriptionId") subscriptionId: string,
        @Body() dto: RequestUpdateSubscriptionDto,
    ) {
        return this.adminSubscriptionsService.updateSubscription(
            subscriptionId,
            dto,
        );
    }
}
