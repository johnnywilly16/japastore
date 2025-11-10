import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      prisma.sales.aggregate = jest.fn().mockResolvedValue({
        _sum: { totalAmount: 10000 },
      });
      prisma.sales.count = jest.fn().mockResolvedValue(50);
      prisma.products.count = jest.fn().mockResolvedValue(20);
      prisma.products.findMany = jest.fn().mockResolvedValue([
        { stockQuantity: 5, unitPrice: 100 },
        { stockQuantity: 10, unitPrice: 200 },
      ]);
      prisma.customers.count = jest.fn().mockResolvedValue(30);
      prisma.serviceOrders.count = jest.fn().mockResolvedValue(15);

      const result = await service.getDashboard();

      expect(result).toBeDefined();
      expect(result.revenue).toBeDefined();
      expect(result.sales).toBeDefined();
      expect(result.products).toBeDefined();
      expect(result.customers).toBeDefined();
      expect(result.serviceOrders).toBeDefined();
    });
  });

  describe('getSalesChart', () => {
    it('should return sales chart data for 7d period', async () => {
      const mockSales = [
        { saleDate: new Date('2024-01-15'), totalAmount: 1000 },
        { saleDate: new Date('2024-01-16'), totalAmount: 2000 },
      ];

      prisma.sales.findMany = jest.fn().mockResolvedValue(mockSales);

      const result = await service.getSalesChart('7d');

      expect(result).toBeDefined();
      expect(result.labels).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('getTopProducts', () => {
    it('should return top products', async () => {
      prisma.sales.groupBy = jest.fn().mockResolvedValue([
        {
          productId: 1,
          _sum: { quantity: 10, totalAmount: 5000 },
        },
      ]);
      prisma.products.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          externalId: 'product-uuid-1',
          name: 'iPhone 15',
        },
      ]);

      const result = await service.getTopProducts(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers', async () => {
      prisma.customers.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          externalId: 'customer-uuid-1',
          name: 'Test Customer',
          totalSpent: 5000,
          _count: {
            Sales: 5,
          },
        },
      ]);

      const result = await service.getTopCustomers(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue by category', async () => {
      prisma.sales.findMany = jest.fn().mockResolvedValue([
        {
          totalAmount: 5000,
          product: {
            category: {
              externalId: 'cat-uuid-1',
              name: 'Smartphones',
            },
          },
        },
      ]);

      const result = await service.getRevenueByCategory();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getSalesChart', () => {
    it('should return sales chart data for different periods', async () => {
      const mockSales = [
        { saleDate: new Date('2024-01-15'), totalAmount: 1000 },
        { saleDate: new Date('2024-01-16'), totalAmount: 2000 },
      ];

      prisma.sales.findMany = jest.fn().mockResolvedValue(mockSales);

      const periods = ['7d', '30d', '90d', '1y'] as const;
      for (const period of periods) {
        const result = await service.getSalesChart(period);
        expect(result).toBeDefined();
        expect(result.labels).toBeDefined();
        expect(result.data).toBeDefined();
      }
    });
  });
});

