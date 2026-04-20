import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { Product } from 'src/product/entities/product.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Alert, Product])],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}