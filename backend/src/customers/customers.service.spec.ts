import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';
import { Prisma } from '../../generated/prisma';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockCustomer = {
    id: 1,
    externalId: 'customer-uuid-1',
    name: 'Test Customer',
    email: 'test@email.com',
    phone: '123456789',
    totalSpent: 5000,
    totalVisits: 3,
    lastVisit: new Date(),
    Sales: [],
    CustomerVisits: [],
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      const createDto = {
        name: 'New Customer',
        email: 'new@email.com',
        phone: '987654321',
        customerType: 'new' as const,
      };

      prisma.customers.create = jest.fn().mockResolvedValue({
        ...mockCustomer,
        ...createDto,
        Sales: [],
        CustomerVisits: [],
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.customers.create).toHaveBeenCalled();
    });

    it('should create a customer with birthDate', async () => {
      const createDto = {
        name: 'New Customer',
        email: 'new@email.com',
        phone: '987654321',
        customerType: 'new' as const,
        birthDate: '1990-01-01',
      };

      prisma.customers.create = jest.fn().mockResolvedValue({
        ...mockCustomer,
        ...createDto,
        birthDate: new Date('1990-01-01'),
        Sales: [],
        CustomerVisits: [],
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.customers.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email or CPF already exists', async () => {
      const createDto = {
        name: 'New Customer',
        email: 'new@email.com',
        phone: '987654321',
        customerType: 'new' as const,
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.0',
      });
      prisma.customers.create = jest.fn().mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow('Email ou CPF já cadastrado');
    });
  });

  describe('findAll', () => {
    it('should return all customers with pagination', async () => {
      prisma.customers.findMany = jest.fn().mockResolvedValue([mockCustomer]);
      prisma.customers.count = jest.fn().mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toBeDefined();
      expect(result.customers).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should filter customers by search term', async () => {
      prisma.customers.findMany = jest.fn().mockResolvedValue([mockCustomer]);
      prisma.customers.count = jest.fn().mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'Test');

      expect(result).toBeDefined();
      expect(prisma.customers.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);

      const result = await service.findOne('customer-uuid-1');

      expect(result).toBeDefined();
      expect(result.externalId).toBe('customer-uuid-1');
    });

    it('should throw NotFoundException if customer not found', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      prisma.customers.update = jest.fn().mockResolvedValue({ ...mockCustomer, name: 'Updated' });

      const result = await service.update('customer-uuid-1', { name: 'Updated' });

      expect(result).toBeDefined();
      expect(prisma.customers.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if customer not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '6.19.0',
      });
      prisma.customers.update = jest.fn().mockRejectedValue(prismaError);

      await expect(service.update('invalid-uuid', {})).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      prisma.customers.delete = jest.fn().mockResolvedValue(mockCustomer);

      const result = await service.remove('customer-uuid-1');

      expect(result).toBeDefined();
      expect(result.message).toBe('Cliente removido com sucesso');
      expect(prisma.customers.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if customer not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '6.19.0',
      });
      prisma.customers.delete = jest.fn().mockRejectedValue(prismaError);

      await expect(service.remove('invalid-uuid')).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('getCustomerVisits', () => {
    it('should return customer visits', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.customerVisits.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getCustomerVisits('customer-uuid-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createCustomerVisit', () => {
    it('should create a customer visit', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.customerVisits.create = jest.fn().mockResolvedValue({});
      prisma.sales.findMany = jest.fn().mockResolvedValue([]);
      prisma.customerVisits.findMany = jest.fn().mockResolvedValue([]);
      prisma.customers.update = jest.fn().mockResolvedValue(mockCustomer);

      const result = await service.createCustomerVisit('customer-uuid-1', {
        visitDate: new Date(),
        visitType: 'purchase',
        notes: 'Test visit',
      });

      expect(result).toBeDefined();
      expect(prisma.customerVisits.create).toHaveBeenCalled();
    });
  });

  describe('getCustomerVisitStats', () => {
    it('should return customer visit statistics', async () => {
      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.customerVisits.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getCustomerVisitStats('customer-uuid-1');

      expect(result).toBeDefined();
    });
  });

  describe('createSale', () => {
    it('should create a sale successfully', async () => {
      const createSaleDto = {
        customerId: 'customer-uuid-1',
        productId: 'product-uuid-1',
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        paymentMethod: 'credit_card',
        saleDate: new Date().toISOString(),
      };

      const mockProduct = {
        id: 1,
        externalId: 'product-uuid-1',
        stockQuantity: 10,
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.products.findUnique = jest.fn().mockResolvedValue(mockProduct);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          ...prisma,
          sales: {
            ...prisma.sales,
            create: jest.fn().mockResolvedValue({
              id: 1,
              externalId: 'sale-uuid-1',
              customer: mockCustomer,
              product: mockProduct,
            }),
            findMany: jest.fn().mockResolvedValue([]),
          },
          customerVisits: {
            ...prisma.customerVisits,
            findMany: jest.fn().mockResolvedValue([]),
          },
          products: {
            ...prisma.products,
            update: jest.fn().mockResolvedValue(mockProduct),
          },
          customers: {
            ...prisma.customers,
            update: jest.fn().mockResolvedValue(mockCustomer),
          },
          stockMovements: {
            ...prisma.stockMovements,
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.createSale(createSaleDto);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const createSaleDto = {
        customerId: 'customer-uuid-1',
        productId: 'product-uuid-1',
        quantity: 100,
        unitPrice: 1000,
        discount: 0,
        paymentMethod: 'credit_card',
      };

      const mockProduct = {
        id: 1,
        externalId: 'product-uuid-1',
        stockQuantity: 5,
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.products.findUnique = jest.fn().mockResolvedValue(mockProduct);

      await expect(service.createSale(createSaleDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if customer not found', async () => {
      const createSaleDto = {
        customerId: 'invalid-uuid',
        productId: 'product-uuid-1',
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        paymentMethod: 'credit_card',
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.createSale(createSaleDto)).rejects.toThrow('Cliente não encontrado');
    });

    it('should throw NotFoundException if product not found', async () => {
      const createSaleDto = {
        customerId: 'customer-uuid-1',
        productId: 'invalid-uuid',
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        paymentMethod: 'credit_card',
      };

      prisma.customers.findUnique = jest.fn().mockResolvedValue(mockCustomer);
      prisma.products.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.createSale(createSaleDto)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      const customerWithSales = {
        ...mockCustomer,
        Sales: [
          {
            totalAmount: 1000,
            quantity: 1,
            saleDate: new Date('2024-01-01'),
            product: { name: 'Product 1' },
          },
        ],
        CustomerVisits: [
          { visitDate: new Date('2024-01-01') },
          { visitDate: new Date('2024-01-15') },
        ],
        lastVisit: new Date('2024-01-15'),
      };
      prisma.customers.findUnique = jest.fn().mockResolvedValue(customerWithSales);

      const result = await service.getCustomerStats('customer-uuid-1');

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it('should handle customer with no sales', async () => {
      const customerWithoutSales = {
        ...mockCustomer,
        Sales: [],
        CustomerVisits: [],
        lastVisit: null,
      };
      prisma.customers.findUnique = jest.fn().mockResolvedValue(customerWithoutSales);

      const result = await service.getCustomerStats('customer-uuid-1');

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.totalSpent).toBe(0);
      expect(result.stats.totalPurchases).toBe(0);
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers', async () => {
      prisma.customers.findMany = jest.fn().mockResolvedValue([
        {
          ...mockCustomer,
          Sales: [],
          _count: {
            Sales: 5,
            CustomerVisits: 3,
          },
        },
      ]);

      const result = await service.getTopCustomers(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCustomersAtRisk', () => {
    it('should return customers at risk', async () => {
      prisma.customers.findMany = jest.fn().mockResolvedValue([
        {
          ...mockCustomer,
          Sales: [],
        },
      ]);

      const result = await service.getCustomersAtRisk();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

