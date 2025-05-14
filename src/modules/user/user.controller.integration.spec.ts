import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service"
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./models";
import { FsHelper } from "../../helpers";
import { CreateUserDto } from "./dtos";
import { UserRoles } from "./enums";
import { ConflictException } from "@nestjs/common";
import { UserController } from "./user.controller";

describe("Controller - Integration", () => {
    let controller: UserController;

    beforeAll(async () => {
        const ModuleMixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule. forRoot({ envFilePath: '.env.test'}),
                SequelizeModule.forRoot({
                    dialect: 'postgres',
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
                    username: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    logging: false,
                    sync: {
                        alter: true,
                    },
                    autoLoadModels: true,
                }),
                SequelizeModule.forFeature([User])
            ],
            controllers: [UserController],
        }).compile();

        controller = ModuleMixture.get<UserController>(UserController);
    });

    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true, cascade: true});
    });

    afterEach(async () => {
        await User.destroy({ where: {}, truncate: true, cascade: true})
    })

    afterAll(async () => {
        await User.sequelize?.close();
    });

    it('Get  /users -> Get all users', async () => {
        const data: CreateUserDto = {
            age: 10,
            email: 'ali@gmail.com',
            name: 'Ali',
            password: 'ali123',
            role: UserRoles.USER,
        };
        await  controller.create(data);

        const res = await controller.getAll({})

        expect(res.count).toEqual(1);
    })

        it('Create user', async () => {
        const data: CreateUserDto = {
            age: 19,
            email: 'ali@gmail.com',
            name: 'Ali',
            password: 'ali123',
            role: UserRoles.USER,
        };
        
        try {
            await controller.create(data);
            await controller.create(data);
        } catch (error) {
            expect(error).toBeInstanceOf(ConflictException);
            expect(error.message).toEqual("Bunday email'lik foydalanuvchi bor")
        }
    })
})