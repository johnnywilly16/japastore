import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('StockMovementsController', () => {
  let controller: StockMovementsController;
  let service: StockMovementsService;

  const mockMovement = {
    id: 1,
    productId: 1,
    movementType: 'removal',
    quantity: 1,
    unitPrice: 1000,
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [
        StockMovementsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<StockMovementsController>(StockMovementsController);
    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all stock movements', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockMovement] as any);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by type', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockMovement] as any);

      const result = await controller.findAll('removal');

      expect(result).toBeDefined();
      expect(service.findAll).toHaveBeenCalledWith({ type: 'removal' });
    });
  });

  describe('findByProduct', () => {
    it('should return movements for a product', async () => {
      jest.spyOn(service, 'findByProduct').mockResolvedValue([mockMovement] as any);

      const result = await controller.findByProduct('product-uuid-1');

      expect(result).toBeDefined();
      expect(service.findByProduct).toHaveBeenCalledWith('product-uuid-1');
    });
  });

  describe('getStats', () => {
    it('should return stock movement statistics', async () => {
      jest.spyOn(service, 'getStats').mockResolvedValue({
        totalAdditions: 100,
        totalRemovals: 50,
      } as any);

      const result = await controller.getStats('30d');

      expect(result).toBeDefined();
      expect(service.getStats).toHaveBeenCalledWith('30d');
    });
  });

  describe('findOne', () => {
    it('should return a movement by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMovement as any);

      const result = await controller.findOne('1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});

