import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  DashboardResponseDto,
  RevenueMetrics,
  SalesMetrics,
  ProductsMetrics,
  CustomersMetrics,
  ServiceOrdersMetrics,
} from './dto/dashboard-response.dto';
import { ChartDataDto, TopProductDto, TopCustomerDto, RevenueByCategoryDto } from './dto/chart-data.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue metrics
    const [totalRevenue, todayRevenue, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      this.prisma.sales.aggregate({
        _sum: { totalAmount: true },
      }),
      this.prisma.sales.aggregate({
        _sum: { totalAmount: true },
        where: {
          saleDate: { gte: todayStart },
        },
      }),
      this.prisma.sales.aggregate({
        _sum: { totalAmount: true },
        where: {
          saleDate: { gte: thisMonthStart },
        },
      }),
      this.prisma.sales.aggregate({
        _sum: { totalAmount: true },
        where: {
          saleDate: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    const revenueTotal = Number(totalRevenue._sum.totalAmount || 0);
    const revenueToday = Number(todayRevenue._sum.totalAmount || 0);
    const revenueThisMonth = Number(thisMonthRevenue._sum.totalAmount || 0);
    const revenueLastMonth = Number(lastMonthRevenue._sum.totalAmount || 0);
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;

    const revenue: RevenueMetrics = {
      total: revenueTotal,
      today: revenueToday,
      thisMonth: revenueThisMonth,
      lastMonth: revenueLastMonth,
      growth: Math.round(revenueGrowth * 100) / 100,
    };

    // Sales metrics
    const [totalSales, todaySales, thisMonthSales] = await Promise.all([
      this.prisma.sales.count(),
      this.prisma.sales.count({
        where: { saleDate: { gte: todayStart } },
      }),
      this.prisma.sales.count({
        where: { saleDate: { gte: thisMonthStart } },
      }),
    ]);

    const avgTicket = totalSales > 0 ? revenueTotal / totalSales : 0;

    const sales: SalesMetrics = {
      total: totalSales,
      today: todaySales,
      thisMonth: thisMonthSales,
      avgTicket: Math.round(avgTicket * 100) / 100,
    };

    // Products metrics
    const [totalProducts, lowStockProducts, outOfStockProducts, productsValue] = await Promise.all([
      this.prisma.products.count(),
      this.prisma.products.count({
        where: { stockQuantity: { lte: 10, gt: 0 } },
      }),
      this.prisma.products.count({
        where: { stockQuantity: { lte: 0 } },
      }),
      this.prisma.products.aggregate({
        _sum: {
          stockQuantity: true,
        },
      }),
    ]);

    // Calculate total inventory value
    const products = await this.prisma.products.findMany({
      select: {
        stockQuantity: true,
        unitPrice: true,
      },
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + Number(product.stockQuantity) * Number(product.unitPrice);
    }, 0);

    const productsMetrics: ProductsMetrics = {
      total: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      totalValue: Math.round(totalValue * 100) / 100,
    };

    // Customers metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCustomers, activeCustomers, newCustomers, atRiskCustomers] = await Promise.all([
      this.prisma.customers.count(),
      this.prisma.customers.count({
        where: {
          lastVisit: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.customers.count({
        where: {
          createdAt: { gte: thisMonthStart },
        },
      }),
      this.prisma.customers.count({
        where: {
          AND: [
            { lastVisit: { lt: thirtyDaysAgo } },
            { totalVisits: { gt: 1 } },
          ],
        },
      }),
    ]);

    const customers: CustomersMetrics = {
      total: totalCustomers,
      active: activeCustomers,
      new: newCustomers,
      atRisk: atRiskCustomers,
    };

    // Service Orders metrics
    const [totalServiceOrders, pendingOrders, inProgressOrders, completedOrders] = await Promise.all([
      this.prisma.serviceOrders.count(),
      this.prisma.serviceOrders.count({
        where: { status: 'pending' },
      }),
      this.prisma.serviceOrders.count({
        where: { status: 'inProgress' },
      }),
      this.prisma.serviceOrders.count({
        where: { status: 'completed' },
      }),
    ]);

    const serviceOrders: ServiceOrdersMetrics = {
      total: totalServiceOrders,
      pending: pendingOrders,
      inProgress: inProgressOrders,
      completed: completedOrders,
    };

    return {
      revenue,
      sales,
      products: productsMetrics,
      customers,
      serviceOrders,
    };
  }

  async getSalesChart(period: '7d' | '30d' | '90d' | '1y'): Promise<ChartDataDto> {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month' = 'day';

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'week';
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        groupBy = 'month';
        break;
    }

    const sales = await this.prisma.sales.findMany({
      where: {
        saleDate: { gte: startDate },
      },
      select: {
        saleDate: true,
        totalAmount: true,
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    // Group sales by period
    const grouped: Record<string, number> = {};

    sales.forEach((sale) => {
      const date = new Date(sale.saleDate);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      grouped[key] = (grouped[key] || 0) + Number(sale.totalAmount);
    });

    const labels = Object.keys(grouped).sort();
    const data = labels.map((label) => grouped[label]);

    return { labels, data };
  }

  async getTopProducts(limit: number = 10): Promise<TopProductDto[]> {
    const sales = await this.prisma.sales.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: limit,
    });

    const productIds = sales.map((s) => s.productId);
    const products = await this.prisma.products.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        externalId: true,
        name: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return sales.map((sale) => {
      const product = productMap.get(sale.productId);
      return {
        id: product?.externalId || '',
        name: product?.name || 'Unknown',
        quantity: Number(sale._sum.quantity || 0),
        revenue: Number(sale._sum.totalAmount || 0),
      };
    });
  }

  async getTopCustomers(limit: number = 10): Promise<TopCustomerDto[]> {
    const customers = await this.prisma.customers.findMany({
      take: limit,
      orderBy: {
        totalSpent: 'desc',
      },
      include: {
        _count: {
          select: {
            Sales: true,
          },
        },
      },
    });

    return customers.map((customer) => ({
      id: customer.externalId,
      name: customer.name,
      totalSpent: Number(customer.totalSpent),
      purchaseCount: customer._count.Sales,
    }));
  }

  async getRevenueByCategory(): Promise<RevenueByCategoryDto[]> {
    const sales = await this.prisma.sales.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; revenue: number; count: number }>();

    sales.forEach((sale) => {
      const category = sale.product.category;
      if (!category) return;

      const key = category.externalId;
      const existing = categoryMap.get(key) || {
        name: category.name,
        revenue: 0,
        count: 0,
      };

      existing.revenue += Number(sale.totalAmount);
      existing.count += 1;

      categoryMap.set(key, existing);
    });

    return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      revenue: Math.round(data.revenue * 100) / 100,
      salesCount: data.count,
    }));
  }
}

