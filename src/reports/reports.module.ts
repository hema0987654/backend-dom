import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItem } from 'src/invoice-item/entities/invoice-item.entity';

@Module({
  imports:[TypeOrmModule.forFeature([InvoiceItem])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}