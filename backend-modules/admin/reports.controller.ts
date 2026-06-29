import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AdminReportsService } from './reports.service';

@ApiTags('Admin Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @ApiOperation({ summary: 'Get summary stats' })
  @Get('summary')
  summary(@Req() req: { user: { sub: string } }) {
    return this.reportsService.summary(req.user.sub);
  }

  @ApiOperation({ summary: 'Export scoped CSV report' })
  @Header('Content-Type', 'text/csv')
  @Get('export.csv')
  async exportCsv(@Req() req: { user: { sub: string } }) {
    return this.reportsService.exportCsv(req.user.sub);
  }
}
