import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UserSyncService } from './sync.service';

@ApiTags('User Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user/sync')
export class UserSyncController {
  constructor(private readonly syncService: UserSyncService) {}

  @ApiOperation({ summary: 'Receive offline batch document sync' })
  @Post('batch')
  syncBatch(
    @Req() req: { user: { sub: string } },
    @Body() queue: Array<{ localId: string; sha256: string; payload: unknown }>,
  ) {
    return this.syncService.processBatch(req.user.sub, queue);
  }
}
