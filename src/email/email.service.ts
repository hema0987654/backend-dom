import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly emailUser: string;
  private readonly emailPass: string;

  constructor(private readonly configService: ConfigService) {
    this.emailUser = this.configService.get<string>('email.user') ?? '';
    this.emailPass = this.configService.get<string>('email.pass') ?? '';

    if (!this.emailUser || !this.emailPass) {
      this.logger.warn(
        'Email credentials are not configured. OTP emails will fail until EMAIL_USER/EMAIL_PASS (or ADMIN_EMAIL/EMAIL_PASSWORD) are set.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: Number(this.configService.get<number | string>('email.port')),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.emailUser,
        pass: this.emailPass,
      },
    });
  }

  async sendGenericEmail(to: string, message: string, sub: string) {
    if (!this.emailUser || !this.emailPass) {
      throw new InternalServerErrorException(
        'Email service is not configured. Set EMAIL_USER and EMAIL_PASS in backend .env',
      );
    }

    const mailOptions = {
      from: this.emailUser,
      to,
      subject: sub,
      text: message,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'unknown email transport error';
      throw new InternalServerErrorException(
        `Failed to send email: ${reason}`,
      );
    }
  }
}
