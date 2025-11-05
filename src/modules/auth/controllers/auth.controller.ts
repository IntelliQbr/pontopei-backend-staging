import { Body, Controller, Post } from "@nestjs/common";
import { RequestSignInDto } from "../models/dtos/sign-in/request-sign-in.dto";
import { ResponseSignInDto } from "../models/dtos/sign-in/response-sign-in.dto";
import { RequestSignUpDto } from "../models/dtos/sign-up/request-sign-up.dto";
import { AuthService } from "../services/auth.service";

@Controller("/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/sign-up")
    async signUp(@Body() dto: RequestSignUpDto): Promise<void> {
        return this.authService.signUp(dto);
    }

    @Post("/sign-in")
    async signIn(@Body() dto: RequestSignInDto): Promise<ResponseSignInDto> {
        return this.authService.signIn(dto);
    }

    @Post("/find-by-token")
    async findUserByToken(@Body("token") token: string) {
        return this.authService.findUserByToken(token);
    }
}
