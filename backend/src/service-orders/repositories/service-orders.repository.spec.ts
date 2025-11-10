import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersRepository } from './service-orders.repository';
import { PrismaService } from '../../prisma.service';
import { createMockPrismaService } from '../../test-utils/prisma-mock';
import { NotFoundException } from '@nestjs/common';

describe('ServiceOrdersRepository', () => {
  let repository: ServiceOrdersRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockServiceOrder = {
    id: 1,
    externalId: 'order-uuid-1',
    customerId: 1,
    deviceModel: 'iPhone 13',
    problem: 'Tela quebrada',
    status: 'pending',
    customer: {
      id: 1,
      name: 'Test Customer',
    },
    ServiceOrdersCost: [],
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ServiceOrdersRepository>(ServiceOrdersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service order', async () => {
      prisma.serviceOrders.create = jest.fn().mockResolvedValue(mockServiceOrder);

      const result = await repository.create({
        customerId: 1,
        deviceModel: 'iPhone 13',
        problem: 'Tela quebrada',
      }, 1);

      expect(result).toBeDefined();
      expect(prisma.serviceOrders.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      prisma.serviceOrders.findMany = jest.fn().mockResolvedValue([mockServiceOrder]);

      const result = await repository.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a service order by externalId', async () => {
      prisma.serviceOrders.findUnique = jest.fn().mockResolvedValue(mockServiceOrder);

      const result = await repository.findOne('order-uuid-1');

      expect(result).toBeDefined();
      expect(prisma.serviceOrders.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'order-uuid-1' },
        include: {
          customer: true,
          ServiceOrdersCost: {
            include: {
              Product: true,
            },
          },
        },
      });
    });

    it('should return null if service order not found', async () => {
      prisma.serviceOrders.findUnique = jest.fn().mockResolvedValue(null);

      const result = await repository.findOne('invalid-uuid');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a service order', async () => {
      prisma.serviceOrders.findUnique = jest.fn().mockResolvedValue(mockServiceOrder);
      prisma.serviceOrders.update = jest.fn().mockResolvedValue({
        ...mockServiceOrder,
        problem: 'Updated problem',
      });

      const result = await repository.update({ problem: 'Updated problem' }, 'order-uuid-1');

      expect(result).toBeDefined();
      expect(prisma.serviceOrders.update).toHaveBeenCalled();
    });
  });

  describe('addCost', () => {
    it('should add a cost to service order', async () => {
      prisma.serviceOrders.findUnique = jest.fn().mockResolvedValue(mockServiceOrder);
      prisma.serviceOrdersCost.create = jest.fn().mockResolvedValue({
        id: 1,
        serviceOrderId: 1,
        description: 'Test cost',
        value: 100,
      });

      const result = await repository.addCost('order-uuid-1', {
        description: 'Test cost',
        value: 100,
        quantity: 1,
        type: 'external_service',
      });

      expect(result).toBeDefined();
      expect(prisma.serviceOrdersCost.create).toHaveBeenCalled();
    });
  });
});

