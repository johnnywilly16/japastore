import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from '../repositories/categories/categories.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, PrismaService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
