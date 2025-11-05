import { Module } from "@nestjs/common";
import { ProfileController } from "./controllers/profile.controller";
import { ProfileService } from "./services/profile.service";

@Module({
    providers: [ProfileService],
    controllers: [ProfileController],
})
export class ProfileModule {}
