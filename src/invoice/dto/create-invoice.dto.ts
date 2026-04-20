import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType } from '../entities/invoice.entity';
import { CreateInvoiceItemDto } from 'src/invoice-item/dto/create-invoice-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Type of the invoice',
    enum: InvoiceType,
    example: InvoiceType.SALE,
  })
  @IsNotEmpty({ message: 'Invoice type is required' })
  @IsEnum(InvoiceType, { message: 'Type must be either purchase or sale' })
  readonly type: InvoiceType;

  @ApiProperty({
    description: 'Total amount of the invoice',
    example: 1500.75,
  })
  @IsNotEmpty({ message: 'Total amount is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be greater than zero' })
  readonly totalAmount: number;

  @ApiProperty({
    description: 'Array of invoice items',
    type: [CreateInvoiceItemDto],
    minItems: 1,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @ArrayMinSize(1, { message: 'Invoice must contain at least one item' })
  readonly invoiceItems: CreateInvoiceItemDto[];
}