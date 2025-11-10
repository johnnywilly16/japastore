import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ProductDto } from './dto/product.dto';
import { ProductsRepository } from '../repositories/products/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(data: CreateProductDto): Promise<ProductDto> {
    const result = await this.productsRepository.create(data);

    if (!result) {
      throw new InternalServerErrorException('Product creation failed');
    }

    return {
      id: result.externalId,
      name: result.name,
      categoryId: result.categoryId,
      stockQuantity: result.stockQuantity,
      unitPrice: Number(result.unitPrice),
      description: result.description || undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      category: result.category ? {
        id: result.category.id,
        name: result.category.name,
      } : undefined,
    };
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productsRepository.findAll();

    return products.map(product => ({
      id: product.externalId,
      name: product.name,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      unitPrice: Number(product.unitPrice),
      description: product.description || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : undefined,
    }));
  }

  async findOne(id: string): Promise<ProductDto> {
    const result = await this.productsRepository.findOne(id);
    
    if (!result) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: result.externalId,
      name: result.name,
      categoryId: result.categoryId,
      stockQuantity: result.stockQuantity,
      unitPrice: Number(result.unitPrice),
      description: result.description || undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      category: result.category ? {
        id: result.category.id,
        name: result.category.name,
      } : undefined,
    };
  }

  async update(data: UpdateProductDto, id: string): Promise<ProductDto> {
    const result = await this.productsRepository.update(data, id);

    if (!result) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: result.externalId,
      name: result.name,
      categoryId: result.categoryId,
      stockQuantity: result.stockQuantity,
      unitPrice: Number(result.unitPrice),
      description: result.description || undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      category: result.category ? {
        id: result.category.id,
        name: result.category.name,
      } : undefined,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productsRepository.delete(id);

    if (!result) {
      throw new NotFoundException('Product not found');
    }

    return result;
  }

  async findByCategory(categoryId: number): Promise<ProductDto[]> {
    const products = await this.productsRepository.findByCategory(categoryId);

    return products.map(product => ({
      id: product.externalId,
      name: product.name,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      unitPrice: Number(product.unitPrice),
      description: product.description || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : undefined,
    }));
  }

  async findLowStock(threshold: number = 10): Promise<ProductDto[]> {
    const products = await this.productsRepository.findLowStock(threshold);

    return products.map(product => ({
      id: product.externalId,
      name: product.name,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      unitPrice: Number(product.unitPrice),
      description: product.description || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : undefined,
    }));
  }
}
