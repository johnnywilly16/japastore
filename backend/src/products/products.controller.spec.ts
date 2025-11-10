import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products/products.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 'product-uuid-1',
    name: 'iPhone 15',
    categoryId: 1,
    stockQuantity: 10,
    unitPrice: 1000,
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        ProductsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'iPhone 15',
        categoryId: 1,
        stockQuantity: 10,
        unitPrice: 1000,
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockProduct as any);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockProduct] as any);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);

      const result = await controller.findOne('product-uuid-1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith('product-uuid-1');
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product' };
      jest.spyOn(service, 'update').mockResolvedValue({ ...mockProduct, ...updateDto } as any);

      const result = await controller.update('product-uuid-1', updateDto);

      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith(updateDto, 'product-uuid-1');
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(true);

      await controller.remove('product-uuid-1');

      expect(service.delete).toHaveBeenCalledWith('product-uuid-1');
    });
  });

  describe('findAll', () => {
    it('should return products with low stock when lowStock query param is true', async () => {
      jest.spyOn(service, 'findLowStock').mockResolvedValue([mockProduct] as any);

      const result = await controller.findAll(undefined, 'true');

      expect(result).toBeDefined();
      expect(service.findLowStock).toHaveBeenCalled();
    });
  });
});

