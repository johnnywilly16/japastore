import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockProduct = {
    id: 1,
    externalId: 'product-uuid-1',
    name: 'iPhone 15',
  };

  const mockMovement = {
    id: 1,
    productId: 1,
    movementType: 'removal',
    referenceType: 'sale',
    referenceId: 1,
    quantity: 1,
    unitPrice: 1000,
    notes: 'Test movement',
    createdAt: new Date(),
    updatedAt: new Date(),
    Product: mockProduct,
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all stock movements', async () => {
      (prisma as any).stockMovements.findMany = jest.fn().mockResolvedValue([mockMovement]);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by productId', async () => {
      (prisma as any).products.findUnique = jest.fn().mockResolvedValue(mockProduct);
      (prisma as any).stockMovements.findMany = jest.fn().mockResolvedValue([mockMovement]);

      const result = await service.findAll({ productId: 'product-uuid-1' });

      expect(result).toBeDefined();
    });
  });

  describe('findByProduct', () => {
    it('should return movements for a product', async () => {
      (prisma as any).products.findUnique = jest.fn().mockResolvedValue(mockProduct);
      (prisma as any).stockMovements.findMany = jest.fn().mockResolvedValue([mockMovement]);

      const result = await service.findByProduct('product-uuid-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw NotFoundException if product not found', async () => {
      (prisma as any).products.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findByProduct('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return stock movement statistics', async () => {
      (prisma as any).stockMovements.aggregate = jest.fn().mockResolvedValue({
        _sum: { quantity: 100 },
      });

      const result = await service.getStats('30d');

      expect(result).toBeDefined();
      expect(result.totalAdditions).toBeDefined();
      expect(result.totalRemovals).toBeDefined();
    });
  });
});

