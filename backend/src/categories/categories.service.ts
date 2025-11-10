import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { CategoryDto } from './dto/category.dto';
import { CategoriesRepository } from '../repositories/categories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(data: CreateCategoryDto): Promise<CategoryDto> {
    // Verificar se já existe uma categoria com esse nome
    const existingCategory = await this.categoriesRepository.findByName(data.name);
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const result = await this.categoriesRepository.create(data);

    if (!result) {
      throw new InternalServerErrorException('Category creation failed');
    }

    return {
      id: result.id,
      externalId: result.externalId,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoriesRepository.findAll();

    return categories.map(category => ({
      id: category.id,
      externalId: category.externalId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  async findOne(id: string): Promise<CategoryDto> {
    const result = await this.categoriesRepository.findOne(id);
    
    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: result.id,
      externalId: result.externalId,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async update(data: UpdateCategoryDto, id: string): Promise<CategoryDto> {
    // Se o nome foi fornecido, verificar se já existe
    if (data.name) {
      const existingCategory = await this.categoriesRepository.findByName(data.name);
      if (existingCategory && existingCategory.externalId !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const result = await this.categoriesRepository.update(data, id);

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: result.id,
      externalId: result.externalId,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoriesRepository.delete(id);

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return result;
  }
}
