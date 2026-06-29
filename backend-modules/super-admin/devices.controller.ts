import { Controller, Get, Header, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminDevicesService } from './devices.service';

@ApiTags('Super Admin Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/devices')
export class SuperAdminDevicesController {
  constructor(private readonly devicesService: SuperAdminDevicesService) {}

  @ApiOperation({ summary: 'List all devices' })
  @Get()
  list() {
    return this.devicesService.listAll();
  }

  @ApiOperation({ summary: 'Revoke device' })
  @Patch(':id/revoke')
  revoke(@Param('id') id: string) {
    return this.devicesService.revoke(id);
  }

  @ApiOperation({ summary: 'Export devices CSV' })
  @Header('Content-Type', 'text/csv')
  @Get('export.csv')
  exportCsv() {
    return this.devicesService.exportCsv();
  }
}
