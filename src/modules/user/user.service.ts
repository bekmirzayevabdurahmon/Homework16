import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models/userModel";
import { CreateUserDto } from "./dtos";
import { v4 as uuid4 } from "uuid"
import * as path from "node:path"
import * as fs from "node:fs"
import * as bcrypt from 'bcryptjs';
import { NotFoundError } from "rxjs";
import { FsHelper } from "src/helpers";

@Injectable()
    export class UserService {
        constructor(@InjectModel(User) private userModel: typeof User,
        private fsHelper: FsHelper, ) {}

    async getAll() {
        const users = await this.userModel.findAll()
        return{
            message: "success",
            data: users,
        }
    }

    async create(payload: CreateUserDto, file?: Express.Multer.File) {
        let imageName: string | undefined;
        if(file){
            const uploadDir = path.join(process.cwd(), 'uploads')
            if(!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true});
            }
            const randomName = uuid4()
            const ext = path.extname(file.originalname);
            const fileName = `${randomName}${ext}`
            const uploadPath = path.join(uploadDir, fileName);
            fs.writeFileSync(uploadPath, file.buffer);
            imageName = fileName
        }
        const passwordHash = await bcrypt.hash(payload.password, 10)
        const user = await this.userModel.create({
            name: payload.name,
            email: payload.email,
            password: passwordHash,
            age: payload.age,
            image: imageName,
        });
        return{
            message: "success",
            data: user
        }
    }

  async delete(id: number) {
    const foundedUser = await this.userModel.findByPk(id);

    if (!foundedUser) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (foundedUser.image) {
      await this.fsHelper.removeFiles(foundedUser.image);
    }

    await this.userModel.destroy({ where: { id } });

    return {
      message: "O'chirildi",
      data: foundedUser,
    };
  }
}