import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType } from '../entities/alert.entity';

export class CreateAlertDto {
  @ApiProperty({
    description: 'ID of the product related to the alert',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productId: number; 

  @ApiProperty({
    description: 'Type of the alert',
    enum: AlertType,
    example: AlertType.LOW_STOCK,
  })
  @IsEnum(AlertType, { message: 'type must be either low_stock or out_of_stock' })
  @IsNotEmpty()
  type: AlertType;

  @ApiPropertyOptional({
    description: 'Optional custom message for the alert',
    example: 'Stock is running low for this product',
  })
  @IsString()
  @IsOptional()
  message?: string;
}