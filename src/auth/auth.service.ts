import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private static readonly OTP_EXPIRE_MINUTES = 10;
  private static readonly RESET_CODE_EXPIRE_MINUTES = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeOptional(value?: string): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async sendOtpToUser(user: User) {
    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(
      Date.now() + AuthService.OTP_EXPIRE_MINUTES * 60 * 1000,
    );

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await this.userRepository.save(user);

    try {
      await this.emailService.sendGenericEmail(
        user.email,
        `Your verification code is ${otpCode}. It will expire in ${AuthService.OTP_EXPIRE_MINUTES} minutes.`,
        'OTP Verification Code',
      );
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Failed to send OTP email';
      throw new InternalServerErrorException(reason);
    }
  }

  private async sendResetCodeToUser(user: User) {
    const resetCode = this.generateOtpCode();
    const resetPasswordExpiresAt = new Date(
      Date.now() + AuthService.RESET_CODE_EXPIRE_MINUTES * 60 * 1000,
    );

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await this.userRepository.save(user);

    try {
      await this.emailService.sendGenericEmail(
        user.email,
        `Your password reset code is ${resetCode}. It will expire in ${AuthService.RESET_CODE_EXPIRE_MINUTES} minutes.`,
        'Password Reset Code',
      );
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Failed to send reset password email';
      throw new InternalServerErrorException(reason);
    }
  }

  async create(createAuthDto: CreateAuthDto) {
    const normalizedEmail = this.normalizeEmail(createAuthDto.email);
    const existingUser = await this.userRepository.findOneBy({
      email: normalizedEmail,
    });

    const passhash = await bcrypt.hash(createAuthDto.password, 10);

    if (existingUser) {
      if (existingUser.isOtpVerified) {
        throw new BadRequestException('Email already exists. Please login.');
      }

      existingUser.fName = createAuthDto.fName;
      existingUser.email = normalizedEmail;
      existingUser.password = passhash;
      existingUser.phoneNumber = this.normalizeOptional(
        createAuthDto.phoneNumber,
      );
      existingUser.address = this.normalizeOptional(createAuthDto.address);
      existingUser.profileImage = this.normalizeOptional(
        createAuthDto.profileImage,
      );
      if (createAuthDto.role) {
        existingUser.role = createAuthDto.role;
      }
      existingUser.otpCode = null;
      existingUser.otpExpiresAt = null;
      existingUser.resetPasswordCode = null;
      existingUser.resetPasswordExpiresAt = null;

      const updatedUser = await this.userRepository.save(existingUser);
      await this.sendOtpToUser(updatedUser);

      return {
        message:
          'Account already exists but not verified. A new OTP has been sent to your email.',
      };
    }

    const user = this.userRepository.create({
      ...createAuthDto,
      email: normalizedEmail,
      password: passhash,
      phoneNumber: this.normalizeOptional(createAuthDto.phoneNumber),
      address: this.normalizeOptional(createAuthDto.address),
      profileImage: this.normalizeOptional(createAuthDto.profileImage),
      isOtpVerified: false,
      otpCode: null,
      otpExpiresAt: null,
      resetPasswordCode: null,
      resetPasswordExpiresAt: null,
    });

    const savedUser = await this.userRepository.save(user);

    try {
      await this.sendOtpToUser(savedUser);
    } catch (error) {
      await this.userRepository.delete(savedUser.id);
      const reason =
        error instanceof Error
          ? error.message
          : 'Failed to send OTP email. Please try registering again.';
      throw new InternalServerErrorException(reason);
    }

    return {
      message:
        'The account has been created. OTP has been sent to your email for verification.',
    };
  }

  async resendOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ email: normalizedEmail });

    if (!user) {
      throw new BadRequestException('This email is not found');
    }

    if (user.isOtpVerified) {
      throw new BadRequestException('This email is already verified');
    }

    await this.sendOtpToUser(user);
    return {
      message: 'A new OTP has been sent to your email',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ email: normalizedEmail });

    if (!user) {
      throw new BadRequestException('This email is not found');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this account');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isOtpVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fName: user.fName,
      },
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ email: normalizedEmail });

    if (!user) {
      throw new BadRequestException('This email is not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Incorrect password');
    }

    if (!user.isOtpVerified) {
      throw new BadRequestException('Please verify OTP before login');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fName: user.fName,
      },
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ email: normalizedEmail });

    if (user) {
      await this.sendResetCodeToUser(user);
    }

    return {
      message:
        'If this email exists, a password reset code has been sent.',
    };
  }

  async resetPassword(email: string, resetCode: string, newPassword: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ email: normalizedEmail });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpiresAt) {
      throw new BadRequestException('Invalid email or reset code');
    }

    if (new Date() > user.resetPasswordExpiresAt) {
      throw new BadRequestException('Reset code has expired');
    }

    if (user.resetPasswordCode !== resetCode) {
      throw new BadRequestException('Invalid email or reset code');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpiresAt = null;
    await this.userRepository.save(user);

    return {
      message: 'Password has been reset successfully',
    };
  }
}
