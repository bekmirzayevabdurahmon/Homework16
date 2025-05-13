import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "../dtos";

@Controller()
export class AuthController {
    constructor(private service: AuthService) {}

    @Post('sign-up')
    async signUp(@Body() payload: RegisterDto) {
        return await this.service.register(payload)
    }

    @Post('sign-in')
    async signIn(@Body() payload: LoginDto) {
        return await this.service.login(payload)
    }
}