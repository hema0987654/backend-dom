import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from 'src/decorator/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(RolesGuard)
@UsePipes(ValidationPipe)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles('Admin','Storeman')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully.' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @Roles('Admin','Seller', 'Storeman', 'Accountant')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of all suppliers.' })
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @Roles('Admin','Seller', 'Storeman', 'Accountant')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin','Storeman')
  @ApiOperation({ summary: 'Update supplier by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete supplier by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}