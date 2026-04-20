import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/decorator/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';

@ApiTags('Products')
@UsePipes(ValidationPipe)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('Admin', 'Storeman')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles('Admin', 'Seller', 'Storeman', 'Accountant')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minQuantity', required: false })
  @ApiQuery({ name: 'maxQuantity', required: false })
  @ApiQuery({ name: 'sortBy', enum: ['sellPrice', 'quantity', 'name'], required: false })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getProducts(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minQuantity') minQuantity?: string,
    @Query('maxQuantity') maxQuantity?: string,
    @Query('sortBy') sortBy?: 'sellPrice' | 'quantity' | 'name',
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
    };

    const products = await this.productsService.findAll({
      filters,
      sortBy,
      order,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return { message: 'Products retrieved successfully', data: products };
  }

  @Get(':id')
  @Roles('Admin', 'Seller', 'Storeman', 'Accountant')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Admin', 'Storeman')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiBody({ type: UpdateProductDto })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete product by ID' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}