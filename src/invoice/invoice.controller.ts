import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/decorator/roles/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Invoices')
@UseGuards(RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles('Admin', 'Storeman')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Invoice successfully created' })
  create(
    @Body(new ValidationPipe({ whitelist: true }))
    createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  @Roles('Admin', 'Seller', 'Storeman', 'Accountant')
  @ApiOperation({ summary: 'Retrieve all invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices retrieved successfully' })
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'customer')
  @ApiOperation({ summary: 'Retrieve a single invoice by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an invoice by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true }))
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an invoice by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.remove(id);
  }
}