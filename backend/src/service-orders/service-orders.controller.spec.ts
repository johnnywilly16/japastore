import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersService } from './service-orders.service';

describe('ServiceOrdersController', () => {
  let controller: ServiceOrdersController;
  let service: ServiceOrdersService;

  const mockServiceOrder = {
    id: 'order-uuid-1',
    customerId: 'customer-uuid-1',
    customer: { id: 'customer-uuid-1', name: 'Test Customer' },
    deviceModel: 'iPhone 13',
    problem: 'Tela quebrada',
    priority: 'high',
    status: 'pending',
    totalCost: 500,
    costs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrdersController],
      providers: [
        {
          provide: ServiceOrdersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockServiceOrder),
            findAll: jest.fn().mockResolvedValue([mockServiceOrder]),
            findOne: jest.fn().mockResolvedValue(mockServiceOrder),
            update: jest.fn().mockResolvedValue(mockServiceOrder),
            delete: jest.fn().mockResolvedValue({ message: 'Deleted' }),
            updateStatus: jest.fn().mockResolvedValue(mockServiceOrder),
            findByCustomer: jest.fn().mockResolvedValue([mockServiceOrder]),
            addCost: jest.fn().mockResolvedValue(mockServiceOrder),
            removeCost: jest.fn().mockResolvedValue(mockServiceOrder),
          },
        },
      ],
    }).compile();

    controller = module.get<ServiceOrdersController>(ServiceOrdersController);
    service = module.get<ServiceOrdersService>(ServiceOrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a service order', async () => {
      const createDto = {
        customerId: 'customer-uuid-1',
        deviceModel: 'iPhone 13',
        problem: 'Tela quebrada',
        priority: 'high' as const,
      };

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return list of service orders', async () => {
      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a service order by id', async () => {
      const result = await controller.findOne('order-uuid-1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith('order-uuid-1');
    });
  });
});

