import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, MinLength, MaxLength, IsInt, IsPositive, IsOptional } from "class-validator";

export class CreateUserDto {
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
        example: 'Tom123'
    })
    @MinLength(4)
    @MaxLength(16)
    password: string;
    
    @ApiProperty({
        type: 'number',
        required: true,
        example: '18'
    })
    @Transform(({value}) => {return parseInt(value)})
    @IsInt()
    @IsPositive()
    age: number;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'User'
    })
    @IsOptional()
    role: string;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false,
        description: 'Rasmni fayl sifatida yuklang'
    })
    @IsOptional()
    image?: any;
}