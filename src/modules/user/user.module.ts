import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./models/userModel";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthController } from "./models/auth.controller";
import { AuthService } from "./models/auth.service";
import { FsHelper, JwtHelper } from "src/helpers";

@Module({
    imports: [ 
        SequelizeModule.forFeature([User]), 
        JwtModule.register({
            secret: "secret-key",
            signOptions: { expiresIn: '1h' },
    })],
    controllers: [UserController, AuthController],
    providers: [UserService, AuthService, FsHelper, JwtHelper]
})

export class UserModule {}