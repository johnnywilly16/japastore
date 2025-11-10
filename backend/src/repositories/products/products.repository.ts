import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateProductDto } from '../../products/dto/createProduct.dto';
import { UpdateProductDto } from '../../products/dto/updateProduct.dto';
import { Products, Categories } from '../../../generated/prisma';

type ProductWithCategory = Products & {
  category?: Categories | null;
};

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto): Promise<ProductWithCategory | null> {
    try {
      return await this.prisma.products.create({
        data: {
          name: data.name,
          categoryId: data.categoryId,
          stockQuantity: data.stockQuantity,
          unitPrice: data.unitPrice,
          description: data.description,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async findAll(): Promise<ProductWithCategory[]> {
    return await this.prisma.products.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<ProductWithCategory | null> {
    return await this.prisma.products.findUnique({
      where: {
        externalId: id,
      },
      include: {
        category: true,
      },
    });
  }

  async update(data: UpdateProductDto, id: string): Promise<ProductWithCategory | null> {
    try {
      return await this.prisma.products.update({
        where: {
          externalId: id,
        },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
          ...(data.unitPrice && { unitPrice: data.unitPrice }),
          ...(data.description !== undefined && { description: data.description }),
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.products.delete({
        where: {
          externalId: id,
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async findByCategory(categoryId: number): Promise<ProductWithCategory[]> {
    return await this.prisma.products.findMany({
      where: {
        categoryId,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findLowStock(threshold: number = 10): Promise<ProductWithCategory[]> {
    return await this.prisma.products.findMany({
      where: {
        stockQuantity: {
          lte: threshold,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stockQuantity: 'asc',
      },
    });
  }
}
