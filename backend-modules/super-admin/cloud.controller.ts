import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminCloudService } from './cloud.service';

@ApiTags('Super Admin Cloud')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/cloud')
export class SuperAdminCloudController {
  constructor(private readonly cloudService: SuperAdminCloudService) {}

  @ApiOperation({ summary: 'Cloud storage overview' })
  @Get('overview')
  overview() {
    return this.cloudService.overview();
  }

  @ApiOperation({ summary: 'Pending cloud verification list' })
  @Get('verification-list')
  verificationList() {
    return this.cloudService.verificationList();
  }

  @ApiOperation({ summary: 'Accept or reject cloud verification' })
  @Patch(':id/verification')
  setVerification(@Param('id') id: string, @Body('approved') approved: boolean) {
    return this.cloudService.setVerification(id, approved);
  }
}
