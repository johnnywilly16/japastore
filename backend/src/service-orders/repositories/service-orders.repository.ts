import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateServiceOrderDto } from '../dto/create-service-order.dto';
import { UpdateServiceOrderDto } from '../dto/update-service-order.dto';
import { ServiceOrders, Customers, ServiceOrdersCost, Products } from '../../../generated/prisma';

type ServiceOrderWithRelations = ServiceOrders & {
  customer: Customers;
  ServiceOrdersCost: (ServiceOrdersCost & {
    Product?: Products | null;
  })[];
};

@Injectable()
export class ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateServiceOrderDto, customerInternalId: number): Promise<ServiceOrderWithRelations | null> {
    try {
      return await this.prisma.serviceOrders.create({
        data: {
          customerId: customerInternalId,
          deviceModel: data.deviceModel,
          problem: data.problem,
          estimatedCost: data.estimatedCost,
          priority: data.priority,
          status: data.status,
          completionDate: data.completionDate ? new Date(data.completionDate) : null,
        },
        include: {
          customer: true,
          ServiceOrdersCost: {
            include: {
              Product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating service order:', error);
      return null;
    }
  }

  async findAll(filters?: {
    status?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<ServiceOrderWithRelations[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerId) {
      const customer = await this.prisma.customers.findUnique({
        where: { externalId: filters.customerId },
      });
      if (customer) {
        where.customerId = customer.id;
      }
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined;
    const take = filters?.limit;

    return await this.prisma.serviceOrders.findMany({
      where,
      include: {
        customer: true,
        ServiceOrdersCost: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async findOne(id: string): Promise<ServiceOrderWithRelations | null> {
    return await this.prisma.serviceOrders.findUnique({
      where: {
        externalId: id,
      },
      include: {
        customer: true,
        ServiceOrdersCost: {
          include: {
            Product: true,
          },
        },
      },
    });
  }

  async update(data: UpdateServiceOrderDto, id: string): Promise<ServiceOrderWithRelations | null> {
    try {
      const updateData: any = {};

      if (data.deviceModel !== undefined) updateData.deviceModel = data.deviceModel;
      if (data.problem !== undefined) updateData.problem = data.problem;
      if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.completionDate !== undefined) {
        updateData.completionDate = data.completionDate ? new Date(data.completionDate) : null;
      }

      if (data.customerId !== undefined) {
        const customer = await this.prisma.customers.findUnique({
          where: { externalId: data.customerId },
        });
        if (customer) {
          updateData.customerId = customer.id;
        }
      }

      return await this.prisma.serviceOrders.update({
        where: {
          externalId: id,
        },
        data: updateData,
        include: {
          customer: true,
          ServiceOrdersCost: {
            include: {
              Product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating service order:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.serviceOrders.delete({
        where: {
          externalId: id,
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting service order:', error);
      return false;
    }
  }

  async findByCustomer(customerId: string): Promise<ServiceOrderWithRelations[]> {
    const customer = await this.prisma.customers.findUnique({
      where: { externalId: customerId },
    });

    if (!customer) {
      return [];
    }

    return await this.prisma.serviceOrders.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        customer: true,
        ServiceOrdersCost: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStatus(status: string): Promise<ServiceOrderWithRelations[]> {
    return await this.prisma.serviceOrders.findMany({
      where: {
        status: status as any,
      },
      include: {
        customer: true,
        ServiceOrdersCost: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: string, completionDate?: Date): Promise<ServiceOrderWithRelations | null> {
    try {
      return await this.prisma.serviceOrders.update({
        where: {
          externalId: id,
        },
        data: {
          status: status as any,
          completionDate: completionDate || undefined,
        },
        include: {
          customer: true,
          ServiceOrdersCost: {
            include: {
              Product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating service order status:', error);
      return null;
    }
  }

  async addCost(serviceOrderId: string, costData: {
    description: string;
    value: number;
    quantity: number;
    type: 'stock_product' | 'external_service';
    productId?: string;
  }): Promise<ServiceOrdersCost | null> {
    try {
      const serviceOrder = await this.prisma.serviceOrders.findUnique({
        where: { externalId: serviceOrderId },
      });

      if (!serviceOrder) {
        return null;
      }

      const costCreateData: any = {
        serviceOrderId: serviceOrder.id,
        description: costData.description,
        value: costData.value,
        quantity: costData.quantity,
        type: costData.type,
      };

      if (costData.productId && costData.type === 'stock_product') {
        const product = await this.prisma.products.findUnique({
          where: { externalId: costData.productId },
        });
        if (product) {
          costCreateData.productId = product.id;
        }
      }

      return await this.prisma.serviceOrdersCost.create({
        data: costCreateData,
      });
    } catch (error) {
      console.error('Error adding cost to service order:', error);
      return null;
    }
  }

  async removeCost(costId: number): Promise<boolean> {
    try {
      await this.prisma.serviceOrdersCost.delete({
        where: {
          id: costId,
        },
      });
      return true;
    } catch (error) {
      console.error('Error removing cost:', error);
      return false;
    }
  }

  async getCosts(serviceOrderId: string): Promise<ServiceOrdersCost[]> {
    const serviceOrder = await this.prisma.serviceOrders.findUnique({
      where: { externalId: serviceOrderId },
    });

    if (!serviceOrder) {
      return [];
    }

    return await this.prisma.serviceOrdersCost.findMany({
      where: {
        serviceOrderId: serviceOrder.id,
      },
      include: {
        Product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

