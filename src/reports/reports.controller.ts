import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit')
  @ApiOperation({ summary: 'Get profit for a day, month, or year' })
  @ApiQuery({ name: 'type', enum: ['day', 'month', 'year'], required: false, description: 'Type of profit report' })
  @ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format' })
  async getProfit(
    @Query('type') type: 'day' | 'month' | 'year' = 'day', 
    @Query('date') date: string,
  ) {
    return this.reportsService.getProfit(type, date);
  }

  @Get('quantity-sold')
  @ApiOperation({ summary: 'Get quantity of sold products' })
  @ApiQuery({ name: 'date', required: false, description: 'Optional date to filter results' })
  async quantityOfProductsSold(@Query('date') date?: string) {
    return this.reportsService.getQuantityOfProductsSold(date);
  }

  @Get('best-selling')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top products to return' })
  @ApiQuery({ name: 'date', required: false, description: 'Optional date to filter results' })
  async bestSellingProducts(
    @Query('limit') limit?: string,
    @Query('date') date?: string,
  ) {
    const limitNumber = limit ? parseInt(limit) : 10;
    return this.reportsService.getBestSellingProducts(limitNumber, date);
  }

  @Get('active-suppliers')
  @ApiOperation({ summary: 'Get most active suppliers' })
  @ApiQuery({ name: 'date', required: false, description: 'Optional date to filter results' })
  async mostActiveSuppliers(@Query('date') date?: string) {
    return this.reportsService.getMostActiveSuppliers(date);
  }

  @Get('export-full-pdf')
  @ApiOperation({ summary: 'Export full report as PDF' })
  @ApiQuery({ name: 'date', required: true, description: 'Date for the report in YYYY-MM-DD format' })
  async exportFullReportPDF(@Query('date') date: string, @Res() res: Response) {
    return this.reportsService.exportFullReportPDF(date, res);
  }
}