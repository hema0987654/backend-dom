import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Product } from 'src/product/entities/product.entity';
import { In } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product> 
   ) {}


async create(createInvoiceDto: CreateInvoiceDto) {
  const invoiceItems = createInvoiceDto.invoiceItems || [];

  const uniqueProductIds = [...new Set(invoiceItems.map(item => item.productId))];

  const foundProducts = await this.productRepository.findBy({
    id: In(uniqueProductIds),
  });
  console.log('Found Products:', foundProducts);
  

  if (foundProducts.length !== uniqueProductIds.length) {
    throw new Error('One or more products not found');
  }

  for (const item of invoiceItems) {
    const product = foundProducts.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    if (createInvoiceDto.type === 'purchase') {
      product.quantity += item.quantity;
    } else if (createInvoiceDto.type === 'sale') {
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient quantity for product ID ${product.id}`);
      }
      product.quantity -= item.quantity;
    }
  }

  await this.productRepository.save(foundProducts);

  const invoice = this.invoiceRepository.create({
    type: createInvoiceDto.type,
    totalAmount: createInvoiceDto.totalAmount,
    invoiceItems: invoiceItems.map(item => ({
      product: { id: item.productId },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  const savedInvoice = await this.invoiceRepository.save(invoice);

  return {
    message: 'Invoice created successfully',
    invoice: savedInvoice,
  };
}



  async findAll() {
    const invoices = await this.invoiceRepository.find({
      relations: ['invoiceItems', 'createdBy'],
    });
    return { message: 'Invoices retrieved successfully', invoices };
  }

  async findOne(id: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['invoiceItems', 'createdBy'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return { message: 'Invoice found successfully', invoice };
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository.preload({
      id,
      ...updateInvoiceDto,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const updatedInvoice = await this.invoiceRepository.save(invoice);
    return { message: 'Invoice updated successfully', invoice: updatedInvoice };
  }

  async remove(id: number) {
    const invoice = await this.invoiceRepository.findOneBy({ id });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    await this.invoiceRepository.remove(invoice);
    return { message: `Invoice with ID ${id} deleted successfully` };
  }
}