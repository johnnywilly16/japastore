import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller({
  version: '1',
  path: 'reports',
})
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.reportsService.getSalesReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      customerId,
      productId,
    });
  }

  @Get('products')
  getProductsReport() {
    return this.reportsService.getProductsReport();
  }

  @Get('customers')
  getCustomersReport() {
    return this.reportsService.getCustomersReport();
  }

  @Get('inventory')
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('service-orders')
  getServiceOrdersReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.getServiceOrdersReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
  }
}

