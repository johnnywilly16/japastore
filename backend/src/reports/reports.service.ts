import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SalesReportDto } from './dto/sales-report.dto';
import { ProductsReportDto } from './dto/products-report.dto';
import { CustomersReportDto } from './dto/customers-report.dto';
import { InventoryReportDto } from './dto/inventory-report.dto';
import { ServiceOrdersReportDto } from './dto/service-orders-report.dto';
import { ReportFilters } from './dto/report-filters.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(filters?: ReportFilters): Promise<SalesReportDto> {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.saleDate = {};
      if (filters.startDate) where.saleDate.gte = filters.startDate;
      if (filters.endDate) where.saleDate.lte = filters.endDate;
    }

    if (filters?.customerId) {
      const customer = await this.prisma.customers.findUnique({
        where: { externalId: filters.customerId },
      });
      if (customer) where.customerId = customer.id;
    }

    if (filters?.productId) {
      const product = await this.prisma.products.findUnique({
        where: { externalId: filters.productId },
      });
      if (product) where.productId = product.id;
    }

    const sales = await this.prisma.sales.findMany({
      where,
      include: {
        customer: true,
        product: true,
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    const items = sales.map((sale) => ({
      id: sale.externalId,
      customerId: sale.customer.externalId,
      customerName: sale.customer.name,
      productId: sale.product.externalId,
      productName: sale.product.name,
      quantity: sale.quantity,
      unitPrice: Number(sale.unitPrice),
      totalAmount: Number(sale.totalAmount),
      discount: Number(sale.discount),
      paymentMethod: sale.paymentMethod,
      saleDate: sale.saleDate,
    }));

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      items,
      totals: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        averageTicket: Math.round(averageTicket * 100) / 100,
      },
      period: {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
    };
  }

  async getProductsReport(): Promise<ProductsReportDto> {
    const products = await this.prisma.products.findMany({
      include: {
        category: true,
        Sales: true,
      },
    });

    const items = await Promise.all(
      products.map(async (product) => {
        const sales = product.Sales || [];
        const revenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const salesCount = sales.length;

        return {
          id: product.externalId,
          name: product.name,
          categoryId: product.category?.externalId || '',
          categoryName: product.category?.name || 'Uncategorized',
          stockQuantity: product.stockQuantity,
          unitPrice: Number(product.unitPrice),
          totalValue: product.stockQuantity * Number(product.unitPrice),
          salesCount,
          revenue: Math.round(revenue * 100) / 100,
        };
      }),
    );

    const totalProducts = items.length;
    const totalStockValue = items.reduce((sum, p) => sum + p.totalValue, 0);
    const totalRevenue = items.reduce((sum, p) => sum + p.revenue, 0);
    const lowStockCount = items.filter((p) => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
    const outOfStockCount = items.filter((p) => p.stockQuantity === 0).length;

    return {
      items,
      totals: {
        totalProducts,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        lowStockCount,
        outOfStockCount,
      },
    };
  }

  async getCustomersReport(): Promise<CustomersReportDto> {
    const customers = await this.prisma.customers.findMany({
      include: {
        Sales: true,
      },
      orderBy: {
        totalSpent: 'desc',
      },
    });

    const items = customers.map((customer) => {
      const purchaseCount = customer.Sales.length;
      const averageTicket = purchaseCount > 0 ? Number(customer.totalSpent) / purchaseCount : 0;

      return {
        id: customer.externalId,
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        totalSpent: Number(customer.totalSpent),
        purchaseCount,
        averageTicket: Math.round(averageTicket * 100) / 100,
        lastVisit: customer.lastVisit || undefined,
        customerType: customer.customerType,
      };
    });

    const totalCustomers = items.length;
    const totalRevenue = items.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageTicket = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomers = items.filter((c) => c.lastVisit && c.lastVisit >= thirtyDaysAgo).length;

    return {
      items,
      totals: {
        totalCustomers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageTicket: Math.round(averageTicket * 100) / 100,
        activeCustomers,
      },
    };
  }

  async getInventoryReport(): Promise<InventoryReportDto> {
    const products = await this.prisma.products.findMany({
      include: {
        category: true,
        StockMovements: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            StockMovements: true,
          },
        },
      },
    });

    const items = products.map((product) => {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock';
      if (product.stockQuantity === 0) {
        status = 'out_of_stock';
      } else if (product.stockQuantity <= 10) {
        status = 'low_stock';
      } else {
        status = 'in_stock';
      }

      return {
        id: product.externalId,
        name: product.name,
        categoryName: product.category?.name || 'Uncategorized',
        stockQuantity: product.stockQuantity,
        unitPrice: Number(product.unitPrice),
        totalValue: product.stockQuantity * Number(product.unitPrice),
        movementsCount: product._count.StockMovements,
        lastMovementDate: product.StockMovements[0]?.createdAt || undefined,
        status,
      };
    });

    const totalProducts = items.length;
    const totalStockValue = items.reduce((sum, p) => sum + p.totalValue, 0);
    const totalItems = items.reduce((sum, p) => sum + p.stockQuantity, 0);
    const lowStockCount = items.filter((p) => p.status === 'low_stock').length;
    const outOfStockCount = items.filter((p) => p.status === 'out_of_stock').length;

    return {
      items,
      totals: {
        totalProducts,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalItems,
        lowStockCount,
        outOfStockCount,
      },
    };
  }

  async getServiceOrdersReport(filters?: ReportFilters): Promise<ServiceOrdersReportDto> {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const orders = await this.prisma.serviceOrders.findMany({
      where,
      include: {
        customer: true,
        ServiceOrdersCost: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const items = orders.map((order) => {
      const totalCost = order.ServiceOrdersCost.reduce(
        (sum, cost) => sum + Number(cost.value) * cost.quantity,
        0,
      );

      let daysToComplete: number | undefined;
      if (order.completionDate && order.createdAt) {
        daysToComplete = Math.ceil(
          (order.completionDate.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      return {
        id: order.externalId,
        customerId: order.customer.externalId,
        customerName: order.customer.name,
        deviceModel: order.deviceModel,
        problem: order.problem,
        status: order.status,
        priority: order.priority,
        totalCost: Math.round(totalCost * 100) / 100,
        estimatedCost: order.estimatedCost ? Number(order.estimatedCost) : undefined,
        createdAt: order.createdAt,
        completionDate: order.completionDate || undefined,
        daysToComplete,
      };
    });

    const totalOrders = items.length;
    const pending = items.filter((o) => o.status === 'pending').length;
    const inProgress = items.filter((o) => o.status === 'inProgress').length;
    const completed = items.filter((o) => o.status === 'completed').length;
    const cancelled = items.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = items.reduce((sum, o) => sum + o.totalCost, 0);

    const completedOrders = items.filter((o) => o.daysToComplete !== undefined);
    const averageTimeToComplete =
      completedOrders.length > 0
        ? completedOrders.reduce((sum, o) => sum + (o.daysToComplete || 0), 0) /
          completedOrders.length
        : undefined;

    return {
      items,
      totals: {
        totalOrders,
        pending,
        inProgress,
        completed,
        cancelled,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageTimeToComplete: averageTimeToComplete
          ? Math.round(averageTimeToComplete * 100) / 100
          : undefined,
      },
      period: {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
    };
  }
}

