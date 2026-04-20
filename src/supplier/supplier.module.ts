import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/middleware/auth/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]),
JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d' }
})], 
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(SupplierController);
  }
}