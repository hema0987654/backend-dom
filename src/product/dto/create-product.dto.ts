import { 
  IsString, 
  IsNumber, 
  Min, 
  IsPositive, 
  IsNotEmpty,
  IsInt 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  name: string;

  @ApiProperty({ description: 'SKU code of the product' })
  @IsNotEmpty({ message: 'SKU is required' })
  @IsString({ message: 'SKU must be a string' })
  sku: string;

  @ApiProperty({ description: 'Buy price of the product', minimum: 0 })
  @IsNotEmpty({ message: 'Buy price is required' })
  @IsNumber({}, { message: 'Buy price must be a number' })
  @IsPositive({ message: 'Buy price must be a positive number' })
  buyPrice: number;

  @ApiProperty({ description: 'Sell price of the product', minimum: 0 })
  @IsNotEmpty({ message: 'Sell price is required' })
  @IsNumber({}, { message: 'Sell price must be a number' })
  @IsPositive({ message: 'Sell price must be a positive number' })
  sellPrice: number;

  @ApiProperty({ description: 'Quantity in stock', minimum: 0 })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0, { message: 'Quantity must be at least 0' })
  quantity: number;

  @ApiProperty({ description: 'Minimum quantity to maintain in stock', minimum: 0 })
  @IsNotEmpty({ message: 'Minimum quantity is required' })
  @IsNumber({}, { message: 'Minimum quantity must be a number' })
  @Min(0, { message: 'Minimum quantity must be at least 0' })
  minQuantity: number;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNotEmpty({ message: 'Supplier ID is required' })
  @IsInt({ message: 'Supplier ID must be an integer' })
  supplierId: number;
}