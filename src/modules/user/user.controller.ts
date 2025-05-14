import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./dtos";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/pipes";
import { Protected, Roles } from "src/decorators";
import { UserRoles } from "./enums";
import { GetAllUsersQueryDto } from "./dtos/get-all-query.dto";

@Controller('users')
export class UserController{
    constructor(private service: UserService) {}

    @Get()
    @Protected(false)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
    async getAll(@Query() queries: GetAllUsersQueryDto) {
        return await this.service.getAll(queries)
    }

    @ApiOperation({ summary: "User yaratish", description: "Yangi user yaratish" })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Post()
    @Protected(false)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
    async create(
        @Body() payload: CreateUserDto, 
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File) {
        return await this.service.create(payload, file)
    }

    @ApiOperation({ summary: "Userni yangilash", description: "Berilgan ID bo'yicha user ma'lumotlarini yangilash" })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Patch(':id')
    @Protected(false)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
    async update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateUserDto) {
        return await this.service.updateUser(id, payload);
    }

    @ApiOperation({ summary: "Userning rasmni yangilash", description: "Berilgan ID bo'yicha userning rasmni yangilash" })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Patch(':id/image')
    @Protected(false)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
    async updateImage(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
        return await this.service.updateImage(id, file);
    }

    @ApiOperation({ summary: "User o'chirish" })
    @Delete(':id')
    @Protected(false)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.service.delete(id);
    }
}