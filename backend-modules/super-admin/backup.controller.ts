import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminBackupService } from './backup.service';

@ApiTags('Super Admin Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/backup')
export class SuperAdminBackupController {
  constructor(private readonly backupService: SuperAdminBackupService) {}

  @ApiOperation({ summary: 'Trigger manual backup' })
  @Post('trigger')
  trigger(@Req() req: { user: { sub: string } }) {
    return this.backupService.triggerManual(req.user.sub);
  }

  @ApiOperation({ summary: 'List backup history' })
  @Get('history')
  history() {
    return this.backupService.history();
  }

  @ApiOperation({ summary: 'Restore backup' })
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.backupService.restore(id);
  }

  @ApiOperation({ summary: 'Delete backup record' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.backupService.delete(id);
  }
}
