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
import { ProductsService } from './products.service';
import { CreateProductDto, CreateProductDtoSchema } from './dto/createProduct.dto';
import { UpdateProductDto, UpdateProductDtoSchema } from './dto/updateProduct.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';

@Controller({
  version: '1',
  path: 'products',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateProductDtoSchema))
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('lowStock') lowStock?: string) {
    if (categoryId) {
      return this.productsService.findByCategory(parseInt(categoryId));
    }
    
    if (lowStock === 'true') {
      return this.productsService.findLowStock();
    }
    
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductDtoSchema))
    updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(updateProductDto, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
