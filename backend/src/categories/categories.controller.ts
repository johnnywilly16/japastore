import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, CreateCategoryDtoSchema } from './dto/createCategory.dto';
import { UpdateCategoryDto, UpdateCategoryDtoSchema } from './dto/updateCategory.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';

@Controller({
  version: '1',
  path: 'categories',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCategoryDtoSchema))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategoryDtoSchema))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(updateCategoryDto, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
