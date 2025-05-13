import { BadRequestException, CanActivate, ConflictException, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Observable } from "rxjs"
import { PROTECTED_KEY } from "src/decorators";
import { UserRoles } from "src/modules/user/enums";

@Injectable()
export class CheckAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const isProtected = this.reflector.getAllAndOverride<boolean>(
            PROTECTED_KEY,
            [context.getHandler(), context.getClass()],
        );

        const ctx = context.switchToHttp();
        const request =ctx.getRequest<
            Request & { role?: string, userId?: string, }
        >();

        if(!isProtected) {
            request.role = UserRoles.USER;
            return true
        }

        const token = request.headers['authorization'];
        console.log(token)

        if(!token || !token.startsWith('Bearer')) {
            throw new BadRequestException('Iltimos Bearer token yuboring');
        }

        const accessToken = token.split('Bearer')[1].trim();

        if(!accessToken) {
            throw new BadRequestException("Access token berib yuboring");
        }

        try {
            const data = this.jwtService.verify(accessToken);
            request.userId = data?.id;
            request.role = data?.role;
            return true;
        } catch (error) {
            if(error instanceof TokenExpiredError ) {
                throw new ForbiddenException("Token vaqti tugagan");
            }

            if(error instanceof JsonWebTokenError) {
                throw new ConflictException("Token formati yoki o'zi xato");
            }

            throw new InternalServerErrorException("Server xatoligi0");
        }
    }
}