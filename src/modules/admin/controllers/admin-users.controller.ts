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
import { RequestCreateUserDto } from "../models/dtos/users/request-create-user.dto";
import { RequestSetAdminDto } from "../models/dtos/users/request-set-admin.dto";
import { RequestUpdateUserDto } from "../models/dtos/users/request-update-user.dto";
import { FindAllUsersQuery } from "../models/queries/find-all-users.query";
import { AdminUsersService } from "../services/admin-users.service";

@Controller("/admin/users")
@UseGuards(AdminGuard)
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) {}

    @Post()
    async createUser(@Body() dto: RequestCreateUserDto) {
        return this.adminUsersService.createUser(dto);
    }

    @Put(":id")
    async updateUser(
        @Param("id") userId: string,
        @Body() dto: RequestUpdateUserDto,
    ) {
        return this.adminUsersService.updateUser(userId, dto);
    }

    @Put(":id/set-admin")
    async setAdmin(
        @Param("id") userId: string,
        @Body() dto: RequestSetAdminDto,
    ) {
        return this.adminUsersService.setAdmin(userId, dto);
    }

    @Delete(":id")
    async removeUser(@Param("id") userId: string) {
        return this.adminUsersService.removeUser(userId);
    }

    @Get()
    async findAllUsers(@Query() query: FindAllUsersQuery) {
        return this.adminUsersService.findAllUsers(query);
    }
}
