import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from './products.repository';
import { PrismaService } from '../../prisma.service';
import { createMockPrismaService } from '../../test-utils/prisma-mock';
import { NotFoundException } from '@nestjs/common';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockProduct = {
    id: 1,
    externalId: 'product-uuid-1',
    name: 'iPhone 15',
    categoryId: 1,
    stockQuantity: 10,
    unitPrice: 1000,
    category: {
      id: 1,
      name: 'Smartphones',
    },
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      prisma.products.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await repository.create({
        name: 'iPhone 15',
        categoryId: 1,
        stockQuantity: 10,
        unitPrice: 1000,
      });

      expect(result).toBeDefined();
      expect(prisma.products.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      prisma.products.findMany = jest.fn().mockResolvedValue([mockProduct]);

      const result = await repository.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a product by externalId', async () => {
      prisma.products.findUnique = jest.fn().mockResolvedValue(mockProduct);

      const result = await repository.findOne('product-uuid-1');

      expect(result).toBeDefined();
      expect(prisma.products.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'product-uuid-1' },
        include: { category: true },
      });
    });

    it('should return null if product not found', async () => {
      prisma.products.findUnique = jest.fn().mockResolvedValue(null);

      const result = await repository.findOne('invalid-uuid');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      prisma.products.findUnique = jest.fn().mockResolvedValue(mockProduct);
      prisma.products.update = jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated' });

      const result = await repository.update('product-uuid-1', { name: 'Updated' });

      expect(result).toBeDefined();
      expect(prisma.products.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      prisma.products.findUnique = jest.fn().mockResolvedValue(mockProduct);
      prisma.products.delete = jest.fn().mockResolvedValue(mockProduct);

      await repository.delete('product-uuid-1');

      expect(prisma.products.delete).toHaveBeenCalled();
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      prisma.products.findMany = jest.fn().mockResolvedValue([mockProduct]);

      const result = await repository.findLowStock(10);

      expect(result).toBeDefined();
      expect(prisma.products.findMany).toHaveBeenCalled();
    });
  });
});

