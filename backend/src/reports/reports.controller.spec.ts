import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSalesReport', () => {
    it('should return sales report', async () => {
      jest.spyOn(service, 'getSalesReport').mockResolvedValue({
        items: [],
        totals: { totalSales: 0, totalAmount: 0 },
      } as any);

      const result = await controller.getSalesReport();

      expect(result).toBeDefined();
      expect(service.getSalesReport).toHaveBeenCalled();
    });
  });

  describe('getProductsReport', () => {
    it('should return products report', async () => {
      jest.spyOn(service, 'getProductsReport').mockResolvedValue({
        items: [],
        totals: { totalProducts: 0, totalValue: 0 },
      } as any);

      const result = await controller.getProductsReport();

      expect(result).toBeDefined();
      expect(service.getProductsReport).toHaveBeenCalled();
    });
  });

  describe('getCustomersReport', () => {
    it('should return customers report', async () => {
      jest.spyOn(service, 'getCustomersReport').mockResolvedValue({
        items: [],
        totals: { totalCustomers: 0, totalRevenue: 0 },
      } as any);

      const result = await controller.getCustomersReport();

      expect(result).toBeDefined();
      expect(service.getCustomersReport).toHaveBeenCalled();
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report', async () => {
      jest.spyOn(service, 'getInventoryReport').mockResolvedValue({
        items: [],
        totals: { totalProducts: 0, totalValue: 0 },
      } as any);

      const result = await controller.getInventoryReport();

      expect(result).toBeDefined();
      expect(service.getInventoryReport).toHaveBeenCalled();
    });
  });

  describe('getServiceOrdersReport', () => {
    it('should return service orders report', async () => {
      jest.spyOn(service, 'getServiceOrdersReport').mockResolvedValue({
        items: [],
        totals: { totalOrders: 0, totalCost: 0 },
      } as any);

      const result = await controller.getServiceOrdersReport();

      expect(result).toBeDefined();
      expect(service.getServiceOrdersReport).toHaveBeenCalled();
    });
  });
});

