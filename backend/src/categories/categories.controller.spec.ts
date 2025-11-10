import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../repositories/categories/categories.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: 'category-uuid-1',
    name: 'Smartphones',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        CategoriesRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = { name: 'Smartphones' };
      jest.spyOn(service, 'create').mockResolvedValue(mockCategory as any);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockCategory] as any);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCategory as any);

      const result = await controller.findOne('category-uuid-1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith('category-uuid-1');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Updated Category' };
      jest.spyOn(service, 'update').mockResolvedValue({ ...mockCategory, ...updateDto } as any);

      const result = await controller.update('category-uuid-1', updateDto);

      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith(updateDto, 'category-uuid-1');
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(true);

      await controller.remove('category-uuid-1');

      expect(service.delete).toHaveBeenCalledWith('category-uuid-1');
    });
  });
});

