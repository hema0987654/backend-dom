import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { InvoiceItemService } from './invoice-item.service';
import { InvoiceItemController } from './invoice-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItem } from './entities/invoice-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/middleware/auth/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem]),
JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' }
  }),
AuthModule],
  exports: [InvoiceItemService],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService],
})

export class InvoiceItemModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) 
      .forRoutes(InvoiceItemController); 
  }
}