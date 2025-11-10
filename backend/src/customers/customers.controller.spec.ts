
jest.mock('../configs/config.env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    SERVER_PORT: 3000,
    JWT_SECRET: 'test-secret',
    JWT_EXPIRATION_TIME: 3600,
    JWT_ISSUER: 'test-issuer',
    JWT_AUDIENCE: 'test-audience',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';
import { AuthGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomer = {
    id: 'customer-uuid-1',
    name: 'Test Customer',
    email: 'test@email.com',
    phone: '123456789',
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createDto = {
        name: 'New Customer',
        email: 'new@email.com',
        phone: '987654321',
        customerType: 'new' as const,
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockCustomer as any);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockCustomer] as any);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCustomer as any);

      const result = await controller.findOne('customer-uuid-1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith('customer-uuid-1');
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = { name: 'Updated Customer' };
      jest.spyOn(service, 'update').mockResolvedValue({ ...mockCustomer, ...updateDto } as any);

      const result = await controller.update('customer-uuid-1', updateDto);

      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith('customer-uuid-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('customer-uuid-1');

      expect(service.remove).toHaveBeenCalledWith('customer-uuid-1');
    });
  });

  describe('createSale', () => {
    it('should create a sale for a customer', async () => {
      const createSaleDto = {
        customerId: 'customer-uuid-1',
        productId: 'product-uuid-1',
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        paymentMethod: 'credit_card',
      };
      jest.spyOn(service, 'createSale').mockResolvedValue({} as any);

      const result = await controller.createSale(createSaleDto);

      expect(result).toBeDefined();
      expect(service.createSale).toHaveBeenCalledWith(createSaleDto);
    });
  });

  describe('getCustomerVisits', () => {
    it('should return customer visits', async () => {
      jest.spyOn(service, 'getCustomerVisits').mockResolvedValue([] as any);

      const result = await controller.getCustomerVisits('customer-uuid-1');

      expect(result).toBeDefined();
      expect(service.getCustomerVisits).toHaveBeenCalledWith('customer-uuid-1');
    });
  });

  describe('createCustomerVisit', () => {
    it('should create a customer visit', async () => {
      const visitDate = new Date();
      const createVisitDto = {
        visitDate: visitDate.toISOString(),
        visitType: 'purchase' as const,
        notes: 'Test visit',
      };
      jest.spyOn(service, 'createCustomerVisit').mockResolvedValue({} as any);

      const result = await controller.createCustomerVisit('customer-uuid-1', createVisitDto);

      expect(result).toBeDefined();
      expect(service.createCustomerVisit).toHaveBeenCalledWith('customer-uuid-1', {
        visitDate: new Date(visitDate.toISOString()),
        visitType: 'purchase',
        notes: 'Test visit',
      });
    });
  });
});

