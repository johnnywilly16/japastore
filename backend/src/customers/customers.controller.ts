import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CreateCustomerSchema } from './dto/create-customer.dto';
import { UpdateCustomerDto, UpdateCustomerSchema } from './dto/update-customer.dto';
import { CreateSaleDto, CreateSaleSchema } from './dto/create-sale.dto';
import { CreateVisitDto, CreateVisitSchema } from './dto/create-visit.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';
import { AuthGuard } from '../guards/auth.guard';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCustomerSchema))
    createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.customersService.findAll(pageNum, limitNum, search);
  }

  @Get('top')
  getTopCustomers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.customersService.getTopCustomers(limitNum);
  }

  @Get('at-risk')
  getCustomersAtRisk() {
    return this.customersService.getCustomersAtRisk();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/stats')
  getCustomerStats(@Param('id') id: string) {
    return this.customersService.getCustomerStats(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCustomerSchema))
    updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Post('sales')
  createSale(
    @Body(new ZodValidationPipe(CreateSaleSchema))
    createSaleDto: CreateSaleDto,
  ) {
    return this.customersService.createSale(createSaleDto);
  }

  @Get(':id/visits')
  getCustomerVisits(@Param('id') id: string) {
    return this.customersService.getCustomerVisits(id);
  }

  @Post(':id/visits')
  createCustomerVisit(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateVisitSchema))
    createVisitDto: CreateVisitDto,
  ) {
    return this.customersService.createCustomerVisit(id, {
      visitDate: createVisitDto.visitDate ? new Date(createVisitDto.visitDate) : undefined,
      visitType: createVisitDto.visitType,
      notes: createVisitDto.notes,
    });
  }

  @Get(':id/visits/stats')
  getCustomerVisitStats(@Param('id') id: string) {
    return this.customersService.getCustomerVisitStats(id);
  }
}
