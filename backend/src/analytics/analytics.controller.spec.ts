import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockDashboard = {
    revenue: { total: 10000, today: 1000, thisMonth: 5000, lastMonth: 4000, growth: 25 },
    sales: { total: 50, today: 5, thisMonth: 30, avgTicket: 200 },
    products: { total: 20, lowStock: 5, outOfStock: 2, totalValue: 50000 },
    customers: { total: 30, active: 20, new: 5, atRisk: 3 },
    serviceOrders: { total: 15, pending: 5, inProgress: 3, completed: 7 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getDashboard: jest.fn().mockResolvedValue(mockDashboard),
            getSalesChart: jest.fn().mockResolvedValue({ labels: [], data: [] }),
            getTopProducts: jest.fn().mockResolvedValue([]),
            getTopCustomers: jest.fn().mockResolvedValue([]),
            getRevenueByCategory: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      const result = await controller.getDashboard();

      expect(result).toBeDefined();
      expect(result.revenue).toBeDefined();
      expect(service.getDashboard).toHaveBeenCalled();
    });
  });

  describe('getSalesChart', () => {
    it('should return sales chart data', async () => {
      const result = await controller.getSalesChart('30d');

      expect(result).toBeDefined();
      expect(service.getSalesChart).toHaveBeenCalledWith('30d');
    });
  });
});

