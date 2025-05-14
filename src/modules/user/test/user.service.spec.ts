import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../models';
import { FsHelper } from 'src/helpers/fs.helper';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dtos';

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof User;
  let fsHelper: FsHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {
            findAndCountAll: jest.fn(),
            create: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn(),
          },
        },
        {
          provide: FsHelper,
          useValue: {
            removeFiles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User));
    fsHelper = module.get(FsHelper);
  });

  describe('getAll', () => {
    it('should return filtered users', async () => {
      const mockUsers = { count: 1, rows: [{ id: 1, name: 'Ali', email: 'ali@mail.com', age: 18, role: 'user' }] };
      jest.spyOn(userModel, 'findAndCountAll').mockResolvedValue(mockUsers as any);

      const query = { page: 1, limit: 10 };
      const response = await service.getAll(query);

      expect(response.data.length).toBe(1);
      expect(response.data[0].name).toBe('Ali');
      expect(response.count).toBe(1);
      expect(userModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
      });
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const payload: CreateUserDto = {
        name: 'Ali',
        email: 'ali@mail.com',
        password: '1234',
        age: 18,
        role: 'user',
      };

      const hashedUser = { id: 1, ...payload, password: 'hashed1234' };
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed1234' as never);
      jest.spyOn(userModel, 'create').mockResolvedValue(hashedUser as any);

      const response = await service.create(payload);
      expect(response.data).toHaveProperty('name', 'Ali');
      expect(response.data.password).toBe('hashed1234');
      expect(userModel.create).toHaveBeenCalledWith({
        ...payload,
        password: 'hashed1234',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const user = {
        id: 1,
        name: 'Ali',
        email: 'ali@mail.com',
        password: 'hashed1234',
        age: 18,
        role: 'user',
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(user as any);

      const updateDto = { name: 'Updated Ali' };
      const response = await service.updateUser(1, updateDto);

      expect(user.update).toHaveBeenCalledWith(updateDto);
      expect(response.message).toBe('success');
      expect(response.data.name).toBe('Ali');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);
      await expect(service.updateUser(1, { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateImage', () => {
    it('should update user image', async () => {
      const user = {
        id: 1,
        image: 'old.jpg',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(user as any);

      const file = { path: 'new.jpg' } as Express.Multer.File;
      const response = await service.updateImage(1, file);

      expect(fsHelper.removeFiles).toHaveBeenCalledWith('old.jpg');
      expect(user.image).toBe('new.jpg');
      expect(user.save).toHaveBeenCalled();
      expect(response.message).toBe('success');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);
      const file = { path: 'new.jpg' } as Express.Multer.File;
      await expect(service.updateImage(1, file)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user and remove image', async () => {
      const user = {
        id: 1,
        image: 'test.jpg',
        destroy: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(user as any);

      const response = await service.delete(1);
      expect(fsHelper.removeFiles).toHaveBeenCalledWith('test.jpg');
      expect(user.destroy).toHaveBeenCalled();
      expect(response.message).toBe("O'chirildi");
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);
      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});