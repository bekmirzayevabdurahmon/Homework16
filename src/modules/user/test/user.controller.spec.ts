import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dtos';
import { Express } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getAll: jest.fn(),
    create: jest.fn(),
    updateUser: jest.fn(),
    updateImage: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should get all users', async () => {
    const mockResponse = { data: [{ id: 1, name: 'Ali' }] };
    mockUserService.getAll.mockResolvedValue(mockResponse);

    const result = await controller.getAll({ page: 1, limit: 10 } as any);
    expect(result).toEqual(mockResponse);
    expect(service.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should create user', async () => {
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'test@test.com',
      password: '123456',
      age: 20,
      role: 'User', 
    };

    const mockResponse = { data: { ...dto, id: 1 } };
    mockUserService.create.mockResolvedValue(mockResponse);

    const result = await controller.create(dto);
    expect(result.data.name).toBe('Test');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update user', async () => {
    const updateDto = { name: 'Updated' };
    const mockResponse = { data: { name: 'Updated', id: 1 } };
    mockUserService.updateUser.mockResolvedValue(mockResponse);

    const result = await controller.update(1, updateDto as any);
    expect(result.data.name).toBe('Updated');
    expect(service.updateUser).toHaveBeenCalledWith(1, updateDto);
  });

  it('should update user image', async () => {
    const file = { originalname: 'img.png', buffer: Buffer.from([]) } as Express.Multer.File;
    const mockResponse = { message: 'success' };
    mockUserService.updateImage.mockResolvedValue(mockResponse);

    const result = await controller.updateImage(1, file);
    expect(result.message).toBe('success');
    expect(service.updateImage).toHaveBeenCalledWith(1, file);
  });

  it('should delete user', async () => {
    const mockResponse = { message: "O'chirildi" };
    mockUserService.delete.mockResolvedValue(mockResponse);

    const result = await controller.delete(1);
    expect(result.message).toBe("O'chirildi");
    expect(service.delete).toHaveBeenCalledWith(1);
  });
});