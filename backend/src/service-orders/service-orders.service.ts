import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ServiceOrdersRepository } from './repositories/service-orders.repository';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrderResponseDto } from './dto/service-order-response.dto';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly serviceOrdersRepository: ServiceOrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    // Validate customer exists
    const customer = await this.prisma.customers.findUnique({
      where: { externalId: data.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const result = await this.serviceOrdersRepository.create(data, customer.id);

    if (!result) {
      throw new InternalServerErrorException('Failed to create service order');
    }

    return this.mapToResponseDto(result);
  }

  async findAll(filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceOrderResponseDto[]> {
    const filterParams: any = { ...filters };

    if (filters?.startDate) {
      filterParams.startDate = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      filterParams.endDate = new Date(filters.endDate);
    }

    const orders = await this.serviceOrdersRepository.findAll(filterParams);
    return orders.map((order) => this.mapToResponseDto(order));
  }

  async findOne(id: string): Promise<ServiceOrderResponseDto> {
    const result = await this.serviceOrdersRepository.findOne(id);

    if (!result) {
      throw new NotFoundException('Service order not found');
    }

    return this.mapToResponseDto(result);
  }

  async update(id: string, data: UpdateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    // Validate customer if provided
    if (data.customerId) {
      const customer = await this.prisma.customers.findUnique({
        where: { externalId: data.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const result = await this.serviceOrdersRepository.update(data, id);

    if (!result) {
      throw new NotFoundException('Service order not found');
    }

    return this.mapToResponseDto(result);
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.serviceOrdersRepository.delete(id);

    if (!result) {
      throw new NotFoundException('Service order not found');
    }

    return { message: 'Service order deleted successfully' };
  }

  async updateStatus(id: string, data: UpdateStatusDto): Promise<ServiceOrderResponseDto> {
    const completionDate = data.completionDate ? new Date(data.completionDate) : undefined;

    const result = await this.serviceOrdersRepository.updateStatus(
      id,
      data.status,
      completionDate,
    );

    if (!result) {
      throw new NotFoundException('Service order not found');
    }

    return this.mapToResponseDto(result);
  }

  async findByCustomer(customerId: string): Promise<ServiceOrderResponseDto[]> {
    const orders = await this.serviceOrdersRepository.findByCustomer(customerId);
    return orders.map((order) => this.mapToResponseDto(order));
  }

  async addCost(serviceOrderId: string, costData: CreateCostDto): Promise<ServiceOrderResponseDto> {
    // Validate service order exists
    const serviceOrder = await this.serviceOrdersRepository.findOne(serviceOrderId);
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    // If it's a stock product, validate stock availability
    if (costData.type === 'stock_product' && costData.productId) {
      const product = await this.prisma.products.findUnique({
        where: { externalId: costData.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stockQuantity < costData.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    }

    // Add cost in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Add the cost
      const cost = await this.serviceOrdersRepository.addCost(serviceOrderId, costData);

      if (!cost) {
        throw new InternalServerErrorException('Failed to add cost');
      }

      // If it's a stock product, update stock and create stock movement
      if (costData.type === 'stock_product' && costData.productId) {
        const product = await tx.products.findUnique({
          where: { externalId: costData.productId },
        });

        if (product) {
          // Update stock
          await tx.products.update({
            where: { id: product.id },
            data: {
              stockQuantity: {
                decrement: costData.quantity,
              },
            },
          });

          // Create stock movement
          await tx.stockMovements.create({
            data: {
              productId: product.id,
              movementType: 'removal',
              referenceType: 'serviceOrder',
              referenceId: serviceOrder.id,
              quantity: costData.quantity,
              unitPrice: costData.value / costData.quantity,
              notes: `Service order cost: ${costData.description}`,
            },
          });
        }
      }

      // Return updated service order
      return await this.serviceOrdersRepository.findOne(serviceOrderId);
    });

    if (!result) {
      throw new InternalServerErrorException('Failed to retrieve updated service order');
    }

    return this.mapToResponseDto(result);
  }

  async removeCost(serviceOrderId: string, costId: number): Promise<ServiceOrderResponseDto> {
    // Get cost details before removing
    const cost = await this.prisma.serviceOrdersCost.findUnique({
      where: { id: costId },
      include: { Product: true },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    // Validate service order
    const serviceOrder = await this.serviceOrdersRepository.findOne(serviceOrderId);
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    // Remove cost in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // If it was a stock product, restore stock
      if (cost.type === 'stock_product' && cost.productId && cost.Product) {
        await tx.products.update({
          where: { id: cost.Product.id },
          data: {
            stockQuantity: {
              increment: cost.quantity,
            },
          },
        });
      }

      // Remove the cost
      await this.serviceOrdersRepository.removeCost(costId);

      // Return updated service order
      return await this.serviceOrdersRepository.findOne(serviceOrderId);
    });

    if (!result) {
      throw new InternalServerErrorException('Failed to retrieve updated service order');
    }

    return this.mapToResponseDto(result);
  }

  private calculateTotalCost(costs: any[]): number {
    return costs.reduce((total, cost) => {
      return total + Number(cost.value) * cost.quantity;
    }, 0);
  }

  private mapToResponseDto(order: any): ServiceOrderResponseDto {
    const costs = order.ServiceOrdersCost || [];
    const totalCost = this.calculateTotalCost(costs);

    return {
      id: order.externalId,
      customerId: order.customer.externalId,
      customer: {
        id: order.customer.externalId,
        name: order.customer.name,
        email: order.customer.email || undefined,
        phone: order.customer.phone || undefined,
      },
      deviceModel: order.deviceModel,
      problem: order.problem,
      estimatedCost: order.estimatedCost ? Number(order.estimatedCost) : undefined,
      priority: order.priority,
      status: order.status,
      completionDate: order.completionDate || undefined,
      totalCost,
      costs: costs.map((cost: any) => ({
        id: cost.id,
        description: cost.description,
        value: Number(cost.value),
        quantity: cost.quantity,
        type: cost.type,
        productId: cost.Product?.externalId,
        product: cost.Product
          ? {
              id: cost.Product.externalId,
              name: cost.Product.name,
            }
          : undefined,
        createdAt: cost.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

