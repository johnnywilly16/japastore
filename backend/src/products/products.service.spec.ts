import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products/products.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockProduct = {
    id: 1,
    externalId: 'product-uuid-1',
    name: 'iPhone 15',
    categoryId: 1,
    stockQuantity: 10,
    unitPrice: 1000,
    description: 'Test product',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: 1,
      name: 'Smartphones',
    },
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        ProductsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        name: 'iPhone 15',
        categoryId: 1,
        stockQuantity: 10,
        unitPrice: 1000,
        description: 'Test product',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockProduct as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('iPhone 15');
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct as any);

      const result = await service.findOne('product-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('product-uuid-1');
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockProduct] as any);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(repository, 'update').mockResolvedValue({ ...mockProduct, name: 'Updated' } as any);

      const result = await service.update({ name: 'Updated' }, 'product-uuid-1');

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.update({}, 'invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('product-uuid-1');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      await expect(service.delete('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      const lowStockProduct = {
        ...mockProduct,
        stockQuantity: 5,
      };

      jest.spyOn(repository, 'findLowStock').mockResolvedValue([lowStockProduct] as any);

      const result = await service.findLowStock(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

