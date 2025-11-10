import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from '../repositories/products/products.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
