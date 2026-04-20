import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { InvoiceItem } from './entities/invoice-item.entity';

@Injectable()
export class InvoiceItemService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(createInvoiceItemDto: CreateInvoiceItemDto) {
  const invoiceItem = this.invoiceItemRepository.create({
    quantity: createInvoiceItemDto.quantity,
    unitPrice: createInvoiceItemDto.unitPrice,
    product: { id: createInvoiceItemDto.productId },  
    invoice: { id: createInvoiceItemDto.invoiceId },  
  });

  const savedInvoiceItem = await this.invoiceItemRepository.save(invoiceItem);

  return {
    message: 'Invoice item created successfully',
    data: savedInvoiceItem,
  };
}

  async findAll() {
    const items = await this.invoiceItemRepository.find({
      relations: ['invoice', 'product'],
    });

    return {
      message: 'Invoice items retrieved successfully',
      data: items,
    };
  }

  async findOne(id: number) {
    const invoiceItem = await this.invoiceItemRepository.findOne({
      where: { id },
      relations: ['invoice', 'product'],
    });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with id ${id} not found`);
    }

    return {
      message: 'Invoice item retrieved successfully',
      data: invoiceItem,
    };
  }

  async update(id: number, updateInvoiceItemDto: UpdateInvoiceItemDto) {
    const invoiceItem = await this.invoiceItemRepository.preload({
      id,
      ...updateInvoiceItemDto,
    });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with id ${id} not found`);
    }

    const updatedInvoiceItem = await this.invoiceItemRepository.save(invoiceItem);

    return {
      message: 'Invoice item updated successfully',
      data: updatedInvoiceItem,
    };
  }

  async remove(id: number) {
    const invoiceItem = await this.invoiceItemRepository.findOneBy({ id });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with id ${id} not found`);
    }

    await this.invoiceItemRepository.remove(invoiceItem);

    return {
      message: 'Invoice item removed successfully',
    };
  }
}