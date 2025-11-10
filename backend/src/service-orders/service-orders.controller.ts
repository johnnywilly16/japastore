import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto, CreateServiceOrderSchema } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto, UpdateServiceOrderSchema } from './dto/update-service-order.dto';
import { CreateCostDto, CreateCostSchema } from './dto/create-cost.dto';
import { UpdateStatusDto, UpdateStatusSchema } from './dto/update-status.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';

@Controller({
  version: '1',
  path: 'service-orders',
})
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateServiceOrderSchema))
    createServiceOrderDto: CreateServiceOrderDto,
  ) {
    return this.serviceOrdersService.create(createServiceOrderDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.serviceOrdersService.findAll({
      status,
      customerId,
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateServiceOrderSchema))
    updateServiceOrderDto: UpdateServiceOrderDto,
  ) {
    return this.serviceOrdersService.update(id, updateServiceOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceOrdersService.delete(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema))
    updateStatusDto: UpdateStatusDto,
  ) {
    return this.serviceOrdersService.updateStatus(id, updateStatusDto);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.serviceOrdersService.findByCustomer(customerId);
  }

  @Post(':id/costs')
  addCost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateCostSchema))
    createCostDto: CreateCostDto,
  ) {
    return this.serviceOrdersService.addCost(id, createCostDto);
  }

  @Delete(':id/costs/:costId')
  removeCost(
    @Param('id') id: string,
    @Param('costId') costId: string,
  ) {
    return this.serviceOrdersService.removeCost(id, parseInt(costId));
  }
}

