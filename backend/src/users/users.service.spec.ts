import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users/users.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    id: 1,
    externalId: 'user-uuid-1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      jest.spyOn(repository, 'create').mockResolvedValue(mockUser as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('user-uuid-1');
      expect(result.name).toBe('Test User');
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      const createDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      jest.spyOn(repository, 'create').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'User creation failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.findOne('user-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-uuid-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser as any);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.passwordHash).toBe('hashed-password');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

      await expect(service.findByEmail('invalid@example.com')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Updated User' };
      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockUser,
        name: 'Updated User',
      } as any);

      const result = await service.update(updateDto, 'user-uuid-1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated User');
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateDto = { name: 'Updated User' };
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.update(updateDto, 'invalid-uuid')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('user-uuid-1');

      expect(result).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      await expect(service.delete('invalid-uuid')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      await expect(service.delete('user-uuid-1')).rejects.toThrow(
        'User deletion failed',
      );
    });
  });
});
