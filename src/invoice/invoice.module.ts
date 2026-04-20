import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/middleware/auth/auth.middleware';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Product]), 
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  })
], 
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) 
      .forRoutes(InvoiceController);
  }
}