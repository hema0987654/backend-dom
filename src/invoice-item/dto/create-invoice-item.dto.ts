// create-invoice-item.dto.ts
import { IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'Invoice ID', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'invoiceId must be an integer' })
  invoiceId: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'productId must be an integer' })
  productId: number;

  @ApiProperty({ description: 'Quantity of product', minimum: 1, example: 10 })
  @Type(() => Number)
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;

  @ApiProperty({ description: 'Unit price of product', minimum: 0, example: 50.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'unitPrice must be a number with up to 2 decimal places' })
  @Min(0, { message: 'unitPrice must be at least 0' })
  unitPrice: number;
}