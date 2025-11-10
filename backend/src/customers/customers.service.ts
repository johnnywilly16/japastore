import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const customer = await this.prisma.customers.create({
        data: {
          ...createCustomerDto,
          birthDate: createCustomerDto.birthDate 
            ? new Date(createCustomerDto.birthDate) 
            : null,
        },
        include: {
          Sales: {
            include: {
              product: true,
            },
          },
          CustomerVisits: true,
        },
      });

      return customer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email ou CPF já cadastrado');
        }
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.CustomersWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      this.prisma.customers.findMany({
        skip,
        take: limit,
        where,
        include: {
          Sales: {
            include: {
              product: true,
            },
          },
          CustomerVisits: true,
        },
        orderBy: { lastVisit: 'desc' },
      }),
      this.prisma.customers.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customers.findUnique({
      where: { externalId: id },
      include: {
        Sales: {
          include: {
            product: true,
          },
          orderBy: { saleDate: 'desc' },
        },
        CustomerVisits: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.prisma.customers.update({
        where: { externalId: id },
        data: {
          ...updateCustomerDto,
          birthDate: updateCustomerDto.birthDate 
            ? new Date(updateCustomerDto.birthDate) 
            : undefined,
        },
        include: {
          Sales: {
            include: {
              product: true,
            },
          },
          CustomerVisits: true,
        },
      });

      return customer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Cliente não encontrado');
        }
        if (error.code === 'P2002') {
          throw new BadRequestException('Email ou CPF já cadastrado');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.customers.delete({
        where: { externalId: id },
      });
      return { message: 'Cliente removido com sucesso' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Cliente não encontrado');
        }
      }
      throw error;
    }
  }

  async createSale(createSaleDto: CreateSaleDto) {
    try {
      const { customerId, productId, quantity, unitPrice, discount, ...saleData } = createSaleDto;
      
      // Verificar se cliente e produto existem
      const [customer, product] = await Promise.all([
        this.prisma.customers.findUnique({ where: { externalId: customerId } }),
        this.prisma.products.findUnique({ where: { externalId: productId } }),
      ]);

      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }
      
      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      // Verificar estoque
      if (product.stockQuantity < quantity) {
        throw new BadRequestException('Estoque insuficiente');
      }

      const totalAmount = (unitPrice * quantity) - discount;

      // Criar venda e atualizar estoque em transação
      const result = await this.prisma.$transaction(async (tx) => {
        // Criar venda
        const sale = await tx.sales.create({
          data: {
            customerId: customer.id,
            productId: product.id,
            quantity,
            unitPrice,
            totalAmount,
            discount,
            saleDate: saleData.saleDate ? new Date(saleData.saleDate) : new Date(),
            paymentMethod: saleData.paymentMethod,
            notes: saleData.notes,
          },
          include: {
            customer: true,
            product: true,
          },
        });

        // Atualizar estoque do produto
        await tx.products.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: quantity,
            },
          },
        });

        // Atualizar estatísticas do cliente
        const customerStats = await this.calculateCustomerStats(tx, customer.id);
        await tx.customers.update({
          where: { id: customer.id },
          data: {
            totalSpent: customerStats.totalSpent,
            totalVisits: customerStats.totalVisits,
            lastVisit: new Date(),
            averageDaysBetweenVisits: customerStats.averageDaysBetweenVisits,
          },
        });

        // Registrar movimento de estoque
        await tx.stockMovements.create({
          data: {
            productId: product.id,
            movementType: 'removal',
            referenceType: 'purchase',
            referenceId: sale.id,
            quantity,
            unitPrice,
            notes: `Venda para ${customer.name}`,
          },
        });

        // Registrar visita do cliente
        await tx.customerVisits.create({
          data: {
            customerId: customer.id,
            visitDate: new Date(),
            visitType: 'purchase',
            notes: `Compra de ${quantity}x ${product.name}`,
          },
        });

        return sale;
      });

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Cliente ou produto não encontrado');
        }
      }
      throw error;
    }
  }

  async getCustomerStats(id: string) {
    const customer = await this.findOne(id);
    
    // Calcular estatísticas detalhadas
    const sales = customer.Sales;
    const visits = customer.CustomerVisits;
    
    const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalPurchases = sales.length;
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
    
    // Produtos mais comprados
    const productCount = sales.reduce((acc, sale) => {
      const productName = sale.product.name;
      acc[productName] = (acc[productName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const topProducts = Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Calcular frequência de visitas
    const visitDates = visits.map(v => new Date(v.visitDate)).sort((a, b) => a.getTime() - b.getTime());
    let averageDaysBetweenVisits = 0;
    
    if (visitDates.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < visitDates.length; i++) {
        const diff = (visitDates[i].getTime() - visitDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      averageDaysBetweenVisits = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // Determinar risco de churn
    const daysSinceLastVisit = customer.lastVisit 
      ? Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    
    let churnRisk: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastVisit > 90) churnRisk = 'high';
    else if (daysSinceLastVisit > 30) churnRisk = 'medium';

    // Segmentação automática
    let segment: 'vip' | 'regular' | 'occasional' | 'new' = 'new';
    if (totalSpent > 5000 && totalPurchases > 10) segment = 'vip';
    else if (totalSpent > 1000 && totalPurchases > 3) segment = 'regular';
    else if (totalPurchases > 1) segment = 'occasional';

    return {
      ...customer,
      stats: {
        totalSpent,
        totalPurchases,
        averageTicket,
        topProducts,
        averageDaysBetweenVisits: Math.round(averageDaysBetweenVisits),
        daysSinceLastVisit,
        churnRisk,
        segment,
        monthlySpending: this.calculateMonthlySpending(sales),
      },
    };
  }

  private async calculateCustomerStats(tx: any, customerId: number) {
    const sales = await tx.sales.findMany({
      where: { customerId },
      orderBy: { saleDate: 'asc' },
    });

    const visits = await tx.customerVisits.findMany({
      where: { customerId },
      orderBy: { visitDate: 'asc' },
    });

    const totalSpent = sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
    const totalVisits = visits.length;

    // Calcular média de dias entre visitas
    let averageDaysBetweenVisits = 0;
    if (visits.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < visits.length; i++) {
        const diff = (new Date(visits[i].visitDate).getTime() - new Date(visits[i-1].visitDate).getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      averageDaysBetweenVisits = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    }

    return {
      totalSpent,
      totalVisits,
      averageDaysBetweenVisits,
    };
  }

  private calculateMonthlySpending(sales: any[]) {
    const monthlySpending: Record<string, number> = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.saleDate).toISOString().slice(0, 7); // YYYY-MM
      monthlySpending[month] = (monthlySpending[month] || 0) + Number(sale.totalAmount);
    });

    return Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }

  async getTopCustomers(limit = 10) {
    return this.prisma.customers.findMany({
      take: limit,
      orderBy: { totalSpent: 'desc' },
      include: {
        Sales: {
          include: {
            product: true,
          },
        },
        _count: {
          select: {
            Sales: true,
            CustomerVisits: true,
          },
        },
      },
    });
  }

  async getCustomersAtRisk() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.customers.findMany({
      where: {
        AND: [
          { lastVisit: { lt: thirtyDaysAgo } },
          { totalVisits: { gt: 1 } }, // Apenas clientes que já voltaram antes
        ],
      },
      orderBy: { lastVisit: 'asc' },
      include: {
        Sales: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getCustomerVisits(customerId: string) {
    const customer = await this.findOne(customerId);
    return customer.CustomerVisits || [];
  }

  async createCustomerVisit(customerId: string, visitData: {
    visitDate?: Date;
    visitType: 'purchase' | 'service' | 'consultation' | 'complaint';
    notes?: string;
  }) {
    const customer = await this.prisma.customers.findUnique({
      where: { externalId: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const visit = await this.prisma.customerVisits.create({
      data: {
        customerId: customer.id,
        visitDate: visitData.visitDate || new Date(),
        visitType: visitData.visitType,
        notes: visitData.notes,
      },
    });

    // Update customer stats
    const customerStats = await this.calculateCustomerStats(this.prisma, customer.id);
    await this.prisma.customers.update({
      where: { id: customer.id },
      data: {
        totalVisits: customerStats.totalVisits,
        lastVisit: visit.visitDate,
        averageDaysBetweenVisits: customerStats.averageDaysBetweenVisits,
      },
    });

    return visit;
  }

  async getCustomerVisitStats(customerId: string) {
    const customer = await this.findOne(customerId);
    const visits = customer.CustomerVisits || [];

    const visitsByType = visits.reduce((acc, visit) => {
      acc[visit.visitType] = (acc[visit.visitType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const visitDates = visits.map(v => new Date(v.visitDate)).sort((a, b) => a.getTime() - b.getTime());
    let averageDaysBetweenVisits = 0;

    if (visitDates.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < visitDates.length; i++) {
        const diff = (visitDates[i].getTime() - visitDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      averageDaysBetweenVisits = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    return {
      totalVisits: visits.length,
      visitsByType,
      averageDaysBetweenVisits: Math.round(averageDaysBetweenVisits),
      firstVisit: visitDates[0] || null,
      lastVisit: visitDates[visitDates.length - 1] || null,
    };
  }
}
