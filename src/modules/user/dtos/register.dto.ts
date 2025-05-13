import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        type: 'string',
        required: true,
        example: 'Tom'
    })
    @IsString()
    name: string;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'Tom@gmail.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'tom12345'
    })
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password: string;
}