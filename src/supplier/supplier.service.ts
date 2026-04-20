import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
  const supplier = this.supplierRepository.create(createSupplierDto);
  const savedSupplier = await this.supplierRepository.save(supplier);
  return { message: 'Supplier created successfully', supplier: savedSupplier };
}


  async findAll() {
    return await this.supplierRepository.find({ relations: ['products'] });
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return { message: 'Supplier found successfully', supplier };
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierRepository.preload({
      id,
      ...updateSupplierDto,
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    await this.supplierRepository.save(supplier);
    return { message: 'Supplier updated successfully', supplier };
  }

  async remove(id: number) {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    await this.supplierRepository.delete(id);
    return { message: `Supplier with ID ${id} deleted successfully` };
  }
}