import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { UserWithProfile } from "src/core/models/user-with-profile.model";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { UserAuth } from "src/modules/auth/decorators/user-auth.decorator";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { RequestUpdateProfileDto } from "../models/dtos/request-update-profile.dto";
import { ProfileService } from "../services/profile.service";

@Controller("/profile")
@UseGuards(AuthGuard, RolesGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Patch("/update")
    @Roles(["TEACHER", "DIRECTOR"])
    async updateProfile(
        @Body() dto: RequestUpdateProfileDto,
        @UserAuth() user: UserWithProfile,
    ) {
        return this.profileService.updateProfile(dto, user.id);
    }
}
