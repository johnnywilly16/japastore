import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller({
  version: '1',
  path: 'analytics',
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Get('sales-chart')
  getSalesChart(@Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d') {
    return this.analyticsService.getSalesChart(period);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get('top-customers')
  getTopCustomers(@Query('limit') limit?: string) {
    return this.analyticsService.getTopCustomers(limit ? parseInt(limit) : 10);
  }

  @Get('revenue-by-category')
  getRevenueByCategory() {
    return this.analyticsService.getRevenueByCategory();
  }
}

