import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AssignToAdminDto, BulkGenerateDto } from './keys.dto';
import { SuperAdminKeysService } from './keys.service';

@ApiTags('Super Admin Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/keys')
export class SuperAdminKeysController {
  constructor(private readonly keysService: SuperAdminKeysService) {}

  @ApiOperation({ summary: 'Bulk generate keys' })
  @Post('bulk-generate')
  bulkGenerate(@Body() dto: BulkGenerateDto) {
    return this.keysService.bulkGenerate(dto);
  }

  @ApiOperation({ summary: 'Assign key to admin' })
  @Post('assign-to-admin')
  assign(@Body() dto: AssignToAdminDto) {
    return this.keysService.assignToAdmin(dto);
  }

  @ApiOperation({ summary: 'Global key history' })
  @Get('history')
  history() {
    return this.keysService.history();
  }
}
