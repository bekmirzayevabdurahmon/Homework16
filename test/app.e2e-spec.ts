import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { Sequelize } from "sequelize-typescript";
import { AppModule } from "../src/app.module";

describe('APP e2e', () => {
    let app: INestApplication;
    let sequelize: Sequelize;

    beforeAll(async () => {
        const ModuleMixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = ModuleMixture.createNestApplication();
        await app.init();

        sequelize = ModuleMixture.get(Sequelize);
    });

    afterAll(async () => {
        await app.close();
        await sequelize.close();
    });

    it('DB connection', async () => {
        const res = await sequelize.authenticate();
        
        expect(res).toBeUndefined();
    })
})