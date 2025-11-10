import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { PrismaService } from '../../prisma.service';
import { createMockPrismaService } from '../../test-utils/prisma-mock';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockCategory = {
    id: 1,
    externalId: 'category-uuid-1',
    name: 'Smartphones',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      prisma.categories.create = jest.fn().mockResolvedValue(mockCategory);

      const result = await repository.create({ name: 'Smartphones' });

      expect(result).toBeDefined();
      expect(prisma.categories.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      prisma.categories.findMany = jest.fn().mockResolvedValue([mockCategory]);

      const result = await repository.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a category by externalId', async () => {
      prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);

      const result = await repository.findOne('category-uuid-1');

      expect(result).toBeDefined();
      expect(prisma.categories.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'category-uuid-1' },
      });
    });

    it('should return null if category not found', async () => {
      prisma.categories.findUnique = jest.fn().mockResolvedValue(null);

      const result = await repository.findOne('invalid-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a category by name', async () => {
      prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);

      const result = await repository.findByName('Smartphones');

      expect(result).toBeDefined();
      expect(prisma.categories.findUnique).toHaveBeenCalledWith({
        where: { name: 'Smartphones' },
      });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
      prisma.categories.update = jest.fn().mockResolvedValue({ ...mockCategory, name: 'Updated' });

      const result = await repository.update('category-uuid-1', { name: 'Updated' });

      expect(result).toBeDefined();
      expect(prisma.categories.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      prisma.categories.findUnique = jest.fn().mockResolvedValue(mockCategory);
      prisma.categories.delete = jest.fn().mockResolvedValue(mockCategory);

      await repository.delete('category-uuid-1');

      expect(prisma.categories.delete).toHaveBeenCalled();
    });
  });
});

