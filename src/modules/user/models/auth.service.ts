import { ConflictException, Injectable } from "@nestjs/common";
import { User } from "./userModel";
import { InjectModel } from "@nestjs/sequelize";
import { LoginDto, RegisterDto } from "../dtos";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService,
    ) {}

    async register(payload: RegisterDto) {
        await this.#_checkExistUserByEmail(payload.email)

        const passwordHash = bcrypt.hashSync(payload.password, 10);

        const user = await this.userModel.create({
            email: payload.email,
            name: payload.name,
            password: passwordHash
        });

        const accessToken = this.jwtService.sign({ id: user.id, role: user.role});

        return {
            message: "Muvaffaqiyatli kirildi",
            data: {
                accessToken,
                user,
            },
        }
    }

    async login(payload: LoginDto) {
        const user = await this.#_checkUserByEmail(payload.email);
        if(!user.dataValues.password) {
            throw new ConflictException("User paroli mavjud emas")
        }
        
        const isUserMatch = bcrypt.compareSync(payload.password, user.dataValues.password);

        if(!isUserMatch) {
            throw new ConflictException('Parol xato');
        }

        const accessToken = this.jwtService.sign({ id: user.id, role: user.role});

        return {
            message: "Muvoffaqiyatli kirildi",
            data: {
                accessToken,
                user,
            },
        };
    }

    async #_checkExistUserByEmail(email: string) {
        const user = await this.userModel.findOne({ where: { email }})

        if(user) {
            throw new ConflictException(`Bunday email'lik user allaqachon bor`);
        }
    }

    async #_checkUserByEmail(email: string) {
        const user = await this.userModel.findOne({ where: { email }});

        if(!user) {
            throw new ConflictException(`Bunday email'lik user yo'q `)
        }

        return user;
    }
}