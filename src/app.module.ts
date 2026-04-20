import { Module } from '@nestjs/common';
import { DataBaseModuleTsModule } from './database/typeorm.config/typeorm.config.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProductsModule } from './product/product.module';
import { EmailModule } from './email/email.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceItemModule } from './invoice-item/invoice-item.module';
import { AlertsModule } from './alerts/alerts.module';
import { ReportsModule } from './reports/reports.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DataBaseModuleTsModule,
    AuthModule,
    ProductsModule,
    EmailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT
          ? parseInt(process.env.EMAIL_PORT, 10)
          : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || process.env.ADMIN_EMAIL,
          pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from:
          process.env.EMAIL_FROM ||
          process.env.EMAIL_USER ||
          process.env.ADMIN_EMAIL ||
          '"No Reply" <no-reply@example.com>',
      },
    }),
    InvoiceModule,
    InvoiceItemModule,
    AlertsModule,
    ReportsModule,
    SupplierModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
