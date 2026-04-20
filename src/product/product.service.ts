import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createProductDto: CreateProductDto) {
  const supplier = await this.supplierRepository.findOne({
    where: { id: createProductDto.supplierId },
  });

  if (!supplier) {
    throw new NotFoundException('Supplier not found');
  }

  const product = this.productRepository.create({
    name: createProductDto.name,
    sku: createProductDto.sku,
    buyPrice: createProductDto.buyPrice,
    sellPrice: createProductDto.sellPrice,
    quantity: createProductDto.quantity,
    minQuantity: createProductDto.minQuantity,
    supplier
  });

  return await this.productRepository.save(product);
}


async findAll(params?: {
  filters?: { minPrice?: number; maxPrice?: number; minQuantity?: number; maxQuantity?: number },
  sortBy?: 'sellPrice' | 'quantity' | 'name',
  order?: 'ASC' | 'DESC',
  page?: number,
  limit?: number,
}) {
  const qb = this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.supplier', 'supplier');

  if (params?.filters) {
    const { minPrice, maxPrice, minQuantity, maxQuantity } = params.filters;
    if (minPrice !== undefined) qb.andWhere('product.sellPrice >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('product.sellPrice <= :maxPrice', { maxPrice });
    if (minQuantity !== undefined) qb.andWhere('product.quantity >= :minQuantity', { minQuantity });
    if (maxQuantity !== undefined) qb.andWhere('product.quantity <= :maxQuantity', { maxQuantity });
  }

  if (params?.sortBy) {
    qb.orderBy(`product.${params.sortBy}`, params.order || 'ASC');
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  qb.skip((page - 1) * limit).take(limit);

  return qb.getMany();
}

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier', 'invoiceItems'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.save(updatedProduct);
    return updatedProduct;
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}