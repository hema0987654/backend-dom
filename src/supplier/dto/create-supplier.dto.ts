import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Name of the supplier',
    minLength: 3,
    maxLength: 100,
    example: 'ABC Supplies',
  })
  @IsString({ message: 'Supplier name must be a string' })
  @IsNotEmpty({ message: 'Supplier name is required' })
  @Length(3, 100, { message: 'Supplier name must be between 3 and 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Egyptian phone number of the supplier',
    example: '01012345678',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01[0-2,5]{1}[0-9]{8}$/, {
    message: 'Phone number must be a valid Egyptian number (e.g. 01012345678)',
  })
  phone: string;

  @ApiProperty({
    description: 'Address of the supplier',
    minLength: 5,
    maxLength: 200,
    example: '123 Nile St, Cairo, Egypt',
  })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  address: string;

  @ApiProperty({
    description: 'Email of the supplier',
    example: 'supplier@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}