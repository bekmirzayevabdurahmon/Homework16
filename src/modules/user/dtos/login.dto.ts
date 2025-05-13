import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    
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