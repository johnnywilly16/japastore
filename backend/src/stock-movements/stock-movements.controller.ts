import { Controller, Get, Param, Query } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';

@Controller({
  version: '1',
  path: 'stock-movements',
})
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  findAll(
    @Query('type') type?: 'addition' | 'removal',
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockMovementsService.findAll({
      type,
      productId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(productId);
  }

  @Get('stats')
  getStats(@Query('period') period?: '7d' | '30d' | '90d' | '1y') {
    return this.stockMovementsService.getStats(period);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(parseInt(id));
  }
}

