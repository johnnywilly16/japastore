import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersRepository } from './repositories/service-orders.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('ServiceOrdersService', () => {
  let service: ServiceOrdersService;
  let repository: ServiceOrdersRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockCustomer = {
    id: 1,
    externalId: 'customer-uuid-1',
    name: 'Test Customer',
    email: 'test@email.com',
    phone: '123456789',
  };

  const mockServiceOrder = {
    id: 1,
    externalId: 'order-uuid-1',
    customerId: 1,
    deviceModel: 'iPhone 13',
    problem: 'Tela quebrada',
    estimatedCost: 500,
    priority: 'high',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: mockCustomer,
    ServiceOrdersCost: [],
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersService,
        ServiceOrdersRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ServiceOrdersService>(ServiceOrdersService);
    repository = module.get<ServiceOrdersRepository>(ServiceOrdersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service order successfully', async () => {
      const createDto = {
        customerId: 'customer-uuid-1',
        deviceModel: 'iPhone 13',
        problem: 'Tela quebrada',
        estimatedCost: 500,
        priority: 'high' as const,
        status: 'pending' as const,
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      jest.spyOn(repository, 'create').mockResolvedValue(mockServiceOrder as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('order-uuid-1');
      expect(result.customerId).toBe('customer-uuid-1');
      expect(prisma.customers.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'customer-uuid-1' },
      });
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      const createDto = {
        customerId: 'invalid-uuid',
        deviceModel: 'iPhone 13',
        problem: 'Tela quebrada',
        priority: 'high' as const,
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a service order by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);

      const result = await service.findOne('order-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('order-uuid-1');
    });

    it('should throw NotFoundException if service order not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockServiceOrder] as any);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a service order', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);
      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockServiceOrder,
        problem: 'Updated problem',
      } as any);

      const result = await service.update('order-uuid-1', { problem: 'Updated problem' });

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a service order', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('order-uuid-1');

      expect(result).toBeDefined();
      expect(result.message).toBe('Service order deleted successfully');
      expect(repository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service order not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      await expect(service.delete('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update service order status', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);
      jest.spyOn(repository, 'updateStatus').mockResolvedValue({
        ...mockServiceOrder,
        status: 'inProgress',
      } as any);

      const result = await service.updateStatus('order-uuid-1', { status: 'inProgress' });

      expect(result).toBeDefined();
      expect(repository.updateStatus).toHaveBeenCalled();
    });
  });

  describe('findByCustomer', () => {
    it('should return service orders for a customer', async () => {
      jest.spyOn(repository, 'findByCustomer').mockResolvedValue([mockServiceOrder] as any);

      const result = await service.findByCustomer('customer-uuid-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('addCost', () => {
    it('should add cost to service order', async () => {
      const costDto = {
        description: 'Peça de reposição',
        value: 300,
        quantity: 1,
        type: 'external_service' as const,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);
      jest.spyOn(repository, 'addCost').mockResolvedValue({
        id: 1,
        serviceOrderId: 1,
        description: 'Peça de reposição',
        value: 300,
        quantity: 1,
        type: 'external_service',
      } as any);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        const tx = prisma;
        return callback(tx);
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        ...mockServiceOrder,
        ServiceOrdersCost: [{
          id: 1,
          description: 'Peça de reposição',
          value: 300,
          quantity: 1,
          type: 'external_service',
        }],
      } as any);

      const result = await service.addCost('order-uuid-1', costDto);

      expect(result).toBeDefined();
      expect(result.costs.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const costDto = {
        description: 'Produto do estoque',
        value: 100,
        quantity: 100,
        type: 'stock_product' as const,
        productId: 'product-uuid-1',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);
      prisma.products.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        externalId: 'product-uuid-1',
        stockQuantity: 5,
      });

      await expect(service.addCost('order-uuid-1', costDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCost', () => {
    it('should remove cost from service order', async () => {
      const mockCost = {
        id: 1,
        serviceOrderId: 1,
        type: 'external_service',
        quantity: 1,
        Product: null,
      };

      prisma.serviceOrdersCost.findUnique = jest.fn().mockResolvedValue(mockCost);
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockServiceOrder as any);

      jest.spyOn(repository, 'removeCost').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        ...mockServiceOrder,
        ServiceOrdersCost: [],
      } as any);

      const result = await service.removeCost('order-uuid-1', 1);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if cost not found', async () => {
      prisma.serviceOrdersCost.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.removeCost('order-uuid-1', 999)).rejects.toThrow(NotFoundException);
    });
  });
});

