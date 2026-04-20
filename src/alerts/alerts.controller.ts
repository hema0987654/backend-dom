import { Controller, Get, Patch, Param } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiResponse({ status: 200, description: 'List of all alerts retrieved successfully.' })
  findAll() {
    return this.alertsService.findAll();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark an alert as read' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the alert to mark as read' })
  @ApiResponse({ status: 200, description: 'Alert marked as read successfully.' })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  markAsRead(@Param('id') id: string) {
    return this.alertsService.markAsRead(+id);
  }
}