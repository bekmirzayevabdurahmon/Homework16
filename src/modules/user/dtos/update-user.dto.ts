import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, IsEmail, IsInt, IsPositive, IsOptional, MinLength } from "class-validator";
import { CreateUserDto } from "./createUser.dto";
import { Transform } from "class-transformer";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        type: 'string',
        required: false,
        example: 'Tom Updated'
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'TomUpdated@gmail.com'
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'tom123456'
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiProperty({
        type: 'number',
        required: false,
        example: 19
    })
    @Transform(({value}) => {return parseInt(value)})
    @IsInt()
    @IsPositive()
    @IsOptional()
    age?: number;
}