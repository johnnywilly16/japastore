import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCategoryDto } from '../../categories/dto/createCategory.dto';
import { UpdateCategoryDto } from '../../categories/dto/updateCategory.dto';
import { Categories } from '../../../generated/prisma';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Categories | null> {
    try {
      return await this.prisma.categories.create({
        data: {
          name: data.name,
        },
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  async findAll(): Promise<Categories[]> {
    return await this.prisma.categories.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Categories | null> {
    return await this.prisma.categories.findUnique({
      where: {
        externalId: id,
      },
    });
  }

  async findOneById(id: number): Promise<Categories | null> {
    return await this.prisma.categories.findUnique({
      where: {
        id,
      },
    });
  }

  async update(data: UpdateCategoryDto, id: string): Promise<Categories | null> {
    try {
      return await this.prisma.categories.update({
        where: {
          externalId: id,
        },
        data: {
          ...(data.name && { name: data.name }),
        },
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.categories.delete({
        where: {
          externalId: id,
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  async findByName(name: string): Promise<Categories | null> {
    return await this.prisma.categories.findUnique({
      where: {
        name,
      },
    });
  }
}
