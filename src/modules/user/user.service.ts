import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models/userModel";
import { CreateUserDto, UpdateUserDto } from "./dtos";
import { v4 as uuid4 } from "uuid"
import * as path from "node:path"
import * as fs from "node:fs"
import * as bcrypt from 'bcryptjs';
import { FsHelper } from "../../helpers";
import { v4 as uuidv4 } from 'uuid'
import { Op, UniqueConstraintError } from "sequelize";
import { GetAllUsersQueryDto } from "./dtos/get-all-query.dto";

@Injectable()
    export class UserService {
        constructor(@InjectModel(User) private userModel: typeof User,
        private fsHelper: FsHelper, ) {}

async getAll(queries: GetAllUsersQueryDto) {
    const filters: any = {};

    if (queries.minAge) {
      filters.age = { [Op.gte]: queries.minAge };
    }

    if (queries.maxAge) {
      filters.age = { ...filters.age, [Op.lte]: queries.maxAge };
    }

    if (queries.role) {
      filters.role = { [Op.eq]: queries.role };
    }

    const limit = queries.limit ? parseInt(queries.limit.toString(), 10) : 10;
    const page = queries.page ? parseInt(queries.page.toString(), 10) : 1;
    const offset = (page - 1) * limit;

    const order = queries.sortField
      ? [[queries.sortField, queries.sortOrder || "DESC"]]
      : undefined;

    const { count, rows: users } = await this.userModel.findAndCountAll({
      where: filters,
      limit,
      offset,
      attributes: queries.fields,
    });

    return {
      count,
      limit,
      page,
      data: users,
    };
  }

async create(payload: CreateUserDto, file?: Express.Multer.File) {
    try {
        let imageName: string | undefined;
        if (file) {
            const uploadDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const randomName = uuid4();
            const ext = path.extname(file.originalname);
            const fileName = `${randomName}${ext}`;
            const uploadPath = path.join(uploadDir, fileName);
            fs.writeFileSync(uploadPath, file.buffer);
            imageName = fileName;
        }

        const passwordHash = await bcrypt.hash(payload.password, 10);
        const user = await this.userModel.create({
            name: payload.name,
            email: payload.email,
            password: passwordHash,
            age: payload.age,
            image: imageName,
        });

        return {
            message: "success",
            data: user
        };
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            throw new ConflictException("Bunday email'lik foydalanuvchi bor");
        }
        throw error;
    }
}

    async updateUser(id: number, payload: UpdateUserDto) {
        const user = await this.userModel.findByPk(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await user.update(payload);
        return {
            message: "success",
            data: user,
        };
    }

    async updateImage(id: number, file: Express.Multer.File) {
        const user = await this.userModel.findByPk(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (user.image) {
            const oldImagePath = path.join(uploadDir, path.basename(user.image));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        const randomName = uuidv4();
        const ext = path.extname(file.originalname);
        const fileName = `${randomName}${ext}`;
        const uploadPath = path.join(uploadDir, fileName);

        fs.writeFileSync(uploadPath, file.buffer);

        await user.update({ image: fileName });

        return {
            message: "success",
            data: user,
        };
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