import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminConfigService } from './config.service';

@ApiTags('Super Admin Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/config')
export class SuperAdminConfigController {
  constructor(private readonly configService: SuperAdminConfigService) {}

  @ApiOperation({ summary: 'Get system-wide settings and role permissions' })
  @Get()
  get() {
    return this.configService.getConfig();
  }

  @ApiOperation({ summary: 'Update system-wide settings and role permissions' })
  @Patch()
  update(@Body() payload: Record<string, unknown>) {
    return this.configService.updateConfig(payload);
  }
}
