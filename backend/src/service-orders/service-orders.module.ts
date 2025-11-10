import { Module } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersRepository } from './repositories/service-orders.repository';
import { PrismaService } from '../prisma.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService, ServiceOrdersRepository, PrismaService],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}

