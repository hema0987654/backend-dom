import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceItem } from 'src/invoice-item/entities/invoice-item.entity';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async getProfit(type: 'day' | 'month' | 'year', date: string) {
    const qb = this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.invoice', 'invoice')
      .select(
        'SUM((item.unitPrice - product.buyPrice) * item.quantity)',
        'profit',
      )
      .where('invoice.type = :typeSale', { typeSale: 'sale' });

    if (type === 'day') {
      qb.andWhere('DATE(item.created_at) = :date', { date });
    } else if (type === 'month') {
      qb.andWhere('EXTRACT(MONTH FROM item.created_at) = :month', {
        month: new Date(date).getMonth() + 1,
      }).andWhere('EXTRACT(YEAR FROM item.created_at) = :year', {
        year: new Date(date).getFullYear(),
      });
    } else if (type === 'year') {
      qb.andWhere('EXTRACT(YEAR FROM item.created_at) = :year', {
        year: new Date(date).getFullYear(),
      });
    }

    const result = await qb.getRawOne();
    return { profit: Number(result.profit) || 0 };
  }

  async getQuantityOfProductsSold(date?: string) {
    const qb = this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.invoice', 'invoice')
      .select('product.id', 'productid')
      .addSelect('product.name', 'productname')
      .addSelect('SUM(item.quantity)', 'totalsold')
      .where('invoice.type = :type', { type: 'sale' })
      .groupBy('product.id')
      .addGroupBy('product.name');

    if (date) qb.andWhere('DATE(item.created_at) = :date', { date });

    return (await qb.getRawMany()).map((p) => ({
      productName: p.productname,
      totalSold: Number(p.totalsold),
    }));
  }

  async getBestSellingProducts(limit = 10, date?: string) {
    const qb = this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.invoice', 'invoice')
      .select('product.id', 'productid')
      .addSelect('product.name', 'productname')
      .addSelect('SUM(item.quantity)', 'totalsold')
      .where('invoice.type = :type', { type: 'sale' })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('totalsold', 'DESC')
      .limit(limit);

    if (date) qb.andWhere('DATE(item.created_at) = :date', { date });

    return (await qb.getRawMany()).map((p) => ({
      productName: p.productname,
      totalSold: Number(p.totalsold),
    }));
  }

  async getMostActiveSuppliers(date?: string) {
    const qb = this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.supplier', 'supplier')
      .leftJoin('item.invoice', 'invoice')
      .select('supplier.id', 'supplierid')
      .addSelect('supplier.name', 'suppliername')
      .addSelect('SUM(item.quantity)', 'totalsold')
      .where('invoice.type = :type', { type: 'sale' })
      .groupBy('supplier.id')
      .addGroupBy('supplier.name')
      .orderBy('totalsold', 'DESC');

    if (date) qb.andWhere('DATE(item.created_at) = :date', { date });

    return (await qb.getRawMany()).map((s) => ({
      supplierName: s.suppliername,
      totalSold: Number(s.totalsold),
    }));
  }

  async exportFullReportPDF(date: string, res: Response) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=full-report.pdf',
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor('#003366')
      .text('Stock Guard System', { align: 'center' });
    doc
      .fontSize(14)
      .fillColor('#666')
      .text(`Full Report for ${date}`, { align: 'center' });
    doc.moveDown(2);

    const profitResult = await this.getProfit('day', date);
    const profit = profitResult.profit || 0;

    doc
      .fontSize(16)
      .fillColor('#003366')
      .text('Daily Profit', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .fillColor('black')
      .text(`$${profit.toFixed(2)}`);
    doc.moveDown(1);

    const soldProducts = await this.getQuantityOfProductsSold(date);
    doc
      .fontSize(16)
      .fillColor('#003366')
      .text('Quantity of Sold Products', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 400;

    doc
      .fontSize(12)
      .fillColor('#ffffff')
      .rect(itemX - 5, tableTop - 2, 500, 20)
      .fill('#003366');
    doc.fillColor('#ffffff').text('Product Name', itemX, tableTop);
    doc.text('Quantity Sold', qtyX, tableTop);

    doc.moveDown();
    doc.fillColor('black');

    soldProducts.forEach((p, i) => {
      const y = tableTop + 25 + i * 20;
      doc.text(p.productName, itemX, y);
      doc.text(p.totalSold.toString(), qtyX, y);
    });

    doc.moveDown(2);

    const bestSelling = await this.getBestSellingProducts(10, date);
    doc
      .fontSize(16)
      .fillColor('#003366')
      .text('Top 10 Best Selling Products', { underline: true });
    doc.moveDown(0.5);

    const bestTableTop = doc.y;
    doc
      .fontSize(12)
      .fillColor('#ffffff')
      .rect(itemX - 5, bestTableTop - 2, 500, 20)
      .fill('#003366');
    doc.fillColor('#ffffff').text('Product Name', itemX, bestTableTop);
    doc.text('Quantity Sold', qtyX, bestTableTop);

    doc.moveDown();
    doc.fillColor('black');

    bestSelling.forEach((p, i) => {
      const y = bestTableTop + 25 + i * 20;
      doc.text(p.productName, itemX, y);
      doc.text(p.totalSold.toString(), qtyX, y);
    });

    doc.moveDown(2);

    const activeSuppliers = await this.getMostActiveSuppliers(date);
    doc
      .fontSize(16)
      .fillColor('#003366')
      .text('Most Active Suppliers', { underline: true });
    doc.moveDown(0.5);

    const suppliersTop = doc.y;
    doc
      .fontSize(12)
      .fillColor('#ffffff')
      .rect(itemX - 5, suppliersTop - 2, 500, 20)
      .fill('#003366');
    doc.fillColor('#ffffff').text('Supplier Name', itemX, suppliersTop);
    doc.text('Total Sold', qtyX, suppliersTop);

    doc.moveDown();
    doc.fillColor('black');

    activeSuppliers.forEach((s, i) => {
      const y = suppliersTop + 25 + i * 20;
      doc.text(s.supplierName, itemX, y);
      doc.text(s.totalSold.toString(), qtyX, y);
    });

    doc.moveDown(4);
    doc
      .fontSize(10)
      .fillColor('#999')
      .text('Generated by Stock Guard System', { align: 'center' });

    doc.end();
  }
}