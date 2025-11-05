import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { FindAllQuery } from "src/core/models/find-all-query";
import { AdminGuard } from "../guards/admin.guard";
import { AdminAIRequestsService } from "../services/admin-ai-requests.service";

@Controller("admin/ai-requests")
@UseGuards(AdminGuard)
export class AdminAIRequestsController {
    constructor(
        private readonly adminAIRequestsService: AdminAIRequestsService,
    ) {}

    @Get()
    async findAllAIRequests(@Query() query: FindAllQuery) {
        return this.adminAIRequestsService.findAllAIRequests(query);
    }
}
