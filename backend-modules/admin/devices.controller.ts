import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AdminDevicesService } from './devices.service';

@ApiTags('Admin Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/devices')
export class AdminDevicesController {
  constructor(private readonly devicesService: AdminDevicesService) {}

  @ApiOperation({ summary: 'List scoped devices' })
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.devicesService.list(req.user.sub);
  }

  @ApiOperation({ summary: 'Flag inactive device' })
  @Patch(':id/flag-inactive')
  flagInactive(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.devicesService.flagInactive(req.user.sub, id);
  }
}
