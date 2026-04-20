// invoice-item.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InvoiceItemService } from './invoice-item.service';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/decorator/roles/roles.decorator';

@ApiTags('Invoice Items')
@Controller('invoice-item')
@UseGuards(RolesGuard)
@UsePipes(ValidationPipe)
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new invoice item' })
  @ApiBody({ type: CreateInvoiceItemDto })
  @ApiResponse({ status: 201, description: 'Invoice item created successfully' })
  create(@Body() createInvoiceItemDto: CreateInvoiceItemDto) {
    return this.invoiceItemService.create(createInvoiceItemDto);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all invoice items' })
  findAll() {
    return this.invoiceItemService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'customer')
  @ApiOperation({ summary: 'Get an invoice item by ID' })
  findOne(@Param('id') id: string) {
    return this.invoiceItemService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an invoice item by ID' })
  @ApiBody({ type: UpdateInvoiceItemDto })
  update(@Param('id') id: string, @Body() updateInvoiceItemDto: UpdateInvoiceItemDto) {
    return this.invoiceItemService.update(+id, updateInvoiceItemDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an invoice item by ID' })
  remove(@Param('id') id: string) {
    return this.invoiceItemService.remove(+id);
  }
}