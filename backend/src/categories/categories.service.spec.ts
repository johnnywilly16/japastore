import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../repositories/categories/categories.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('CategoriesService', () => {
  let service: CategoriesService;
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
        CategoriesService,
        CategoriesRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createDto = { name: 'Smartphones' };
      jest.spyOn(repository, 'findByName').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockCategory as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Smartphones');
    });

    it('should throw ConflictException if category name already exists', async () => {
      const createDto = { name: 'Smartphones' };
      jest.spyOn(repository, 'findByName').mockResolvedValue(mockCategory as any);

      await expect(service.create(createDto)).rejects.toThrow('Category with this name already exists');
    });

    it('should throw InternalServerErrorException if category creation fails', async () => {
      const createDto = { name: 'Smartphones' };
      jest.spyOn(repository, 'findByName').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Category creation failed');
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockCategory] as any);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory as any);

      const result = await service.findOne('category-uuid-1');

      expect(result).toBeDefined();
      expect(result.externalId).toBe('category-uuid-1');
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      jest.spyOn(repository, 'findByName').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue({ ...mockCategory, name: 'Updated' } as any);

      const result = await service.update({ name: 'Updated' }, 'category-uuid-1');

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should update a category without name check if name is not provided', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(mockCategory as any);

      const result = await service.update({}, 'category-uuid-1');

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if new name already exists', async () => {
      const existingCategory = { ...mockCategory, externalId: 'other-uuid' };
      jest.spyOn(repository, 'findByName').mockResolvedValue(existingCategory as any);

      await expect(service.update({ name: 'Existing' }, 'category-uuid-1')).rejects.toThrow(
        'Category with this name already exists',
      );
    });

    it('should not throw ConflictException if name matches current category', async () => {
      jest.spyOn(repository, 'findByName').mockResolvedValue(mockCategory as any);
      jest.spyOn(repository, 'update').mockResolvedValue(mockCategory as any);

      const result = await service.update({ name: 'Smartphones' }, 'category-uuid-1');

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findByName').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.update({}, 'invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('category-uuid-1');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      await expect(service.delete('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});

