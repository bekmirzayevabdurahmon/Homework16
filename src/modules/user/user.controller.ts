import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos";
import { ApiConsumes } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/pipes";
import { Protected, Roles } from "src/decorators";
import { UserRoles } from "./enums";

@Controller('users')
export class UserController{
    constructor(private service: UserService) {}

    @Get()
    @Protected(true)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
    async getAll() {
        return await this.service.getAll()
    }

    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Post()
    @Protected(false)
    async create(
        @Body() payload: CreateUserDto, 
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File) {
        return await this.service.create(payload, file)
    }
}