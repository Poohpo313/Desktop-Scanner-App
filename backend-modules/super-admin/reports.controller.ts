import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminReportsService } from './reports.service';

@ApiTags('Super Admin Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/reports')
export class SuperAdminReportsController {
  constructor(private readonly reportsService: SuperAdminReportsService) {}

  @ApiOperation({ summary: 'Get full unscoped summary stats' })
  @Get('summary')
  summary() {
    return this.reportsService.summary();
  }

  @ApiOperation({ summary: 'Export full unscoped CSV' })
  @Header('Content-Type', 'text/csv')
  @Get('export.csv')
  exportCsv() {
    return this.reportsService.exportCsv();
  }
}
