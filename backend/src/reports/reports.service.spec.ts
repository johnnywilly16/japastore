import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSalesReport', () => {
    it('should return sales report', async () => {
      const mockSales = [
        {
          externalId: 'sale-uuid-1',
          customer: { externalId: 'customer-uuid-1', name: 'Test Customer' },
          product: { externalId: 'product-uuid-1', name: 'iPhone 15' },
          quantity: 1,
          unitPrice: 1000,
          totalAmount: 1000,
          discount: 0,
          paymentMethod: 'credit_card',
          saleDate: new Date(),
        },
      ];

      prisma.sales.findMany = jest.fn().mockResolvedValue(mockSales);

      const result = await service.getSalesReport();

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });

  describe('getProductsReport', () => {
    it('should return products report', async () => {
      const mockProducts = [
        {
          externalId: 'product-uuid-1',
          name: 'iPhone 15',
          category: { externalId: 'cat-uuid-1', name: 'Smartphones' },
          stockQuantity: 10,
          unitPrice: 1000,
          Sales: [],
        },
      ];

      prisma.products.findMany = jest.fn().mockResolvedValue(mockProducts);

      const result = await service.getProductsReport();

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });

  describe('getCustomersReport', () => {
    it('should return customers report', async () => {
      const mockCustomers = [
        {
          externalId: 'customer-uuid-1',
          name: 'Test Customer',
          email: 'test@email.com',
          phone: '123456789',
          totalSpent: 5000,
          Sales: [],
        },
      ];

      prisma.customers.findMany = jest.fn().mockResolvedValue(mockCustomers);

      const result = await service.getCustomersReport();

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report', async () => {
      const mockProducts = [
        {
          externalId: 'product-uuid-1',
          name: 'iPhone 15',
          stockQuantity: 10,
          unitPrice: 1000,
          category: { externalId: 'cat-uuid-1', name: 'Smartphones' },
          StockMovements: [],
          _count: {
            StockMovements: 0,
          },
        },
      ];

      prisma.products.findMany = jest.fn().mockResolvedValue(mockProducts);

      const result = await service.getInventoryReport();

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });

  describe('getServiceOrdersReport', () => {
    it('should return service orders report', async () => {
      const mockServiceOrders = [
        {
          externalId: 'order-uuid-1',
          customer: { externalId: 'customer-uuid-1', name: 'Test Customer' },
          deviceModel: 'iPhone 13',
          problem: 'Tela quebrada',
          status: 'pending',
          ServiceOrdersCost: [],
        },
      ];

      prisma.serviceOrders.findMany = jest.fn().mockResolvedValue(mockServiceOrders);

      const result = await service.getServiceOrdersReport();

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });

  describe('getSalesReport with filters', () => {
    it('should filter by date range', async () => {
      prisma.sales.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getSalesReport({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result).toBeDefined();
      expect(prisma.sales.findMany).toHaveBeenCalled();
    });

    it('should filter by customerId', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.sales.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getSalesReport({
        customerId: 'customer-uuid-1',
      });

      expect(result).toBeDefined();
      expect(prisma.customers.findUnique).toHaveBeenCalled();
    });

    it('should filter by productId', async () => {
      prisma.products.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.sales.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getSalesReport({
        productId: 'product-uuid-1',
      });

      expect(result).toBeDefined();
      expect(prisma.products.findUnique).toHaveBeenCalled();
    });
  });
});

