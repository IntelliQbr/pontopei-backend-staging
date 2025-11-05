import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { jwtConfig } from "src/config/jwt.config";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";

@Module({
    imports: [JwtModule.register(jwtConfig)],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
