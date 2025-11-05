import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../guards/admin.guard";
import { AdminMetricsService } from "../services/admin-metrics.service";

@Controller("/admin/metrics")
@UseGuards(AdminGuard)
export class AdminMetricsController {
    constructor(private readonly adminMetricsService: AdminMetricsService) {}

    @Get()
    async getMetrics() {
        return this.adminMetricsService.getSystemMetrics();
    }

    @Get("/subscriptions-chart")
    async getSubscriptionsChart() {
        return this.adminMetricsService.getSubscriptionsChart();
    }

    @Get("/last-profiles")
    async getLastProfiles() {
        return this.adminMetricsService.getLastProfiles();
    }
}
