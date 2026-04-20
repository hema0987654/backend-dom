import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit password reset code sent by email',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Reset code must be 6 digits' })
  resetCode: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}
