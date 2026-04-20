import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductsController } from './product.controller';
import { AuthMiddleware } from 'src/middleware/auth/auth.middleware';
import { RolesGuard } from '../auth/roles/roles.guard'; // Make sure this path is correct
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { Supplier } from 'src/supplier/entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Supplier]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, RolesGuard],
})
export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ProductsController);
  }
}