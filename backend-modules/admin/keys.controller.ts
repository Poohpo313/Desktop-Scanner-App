import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AssignKeyDto, GenerateKeyDto } from './keys.dto';
import { AdminKeysService } from './keys.service';

@ApiTags('Admin Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/keys')
export class AdminKeysController {
  constructor(private readonly keysService: AdminKeysService) {}

  @ApiOperation({ summary: 'Generate serial key' })
  @Post('generate')
  generate(@Req() req: { user: { sub: string } }, @Body() dto: GenerateKeyDto) {
    return this.keysService.generate(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Assign serial key to user' })
  @Post('assign')
  assign(@Req() req: { user: { sub: string } }, @Body() dto: AssignKeyDto) {
    return this.keysService.assign(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Revoke key' })
  @Patch(':id/revoke')
  revoke(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.keysService.revoke(req.user.sub, id);
  }

  @ApiOperation({ summary: 'Deactivate key' })
  @Patch(':id/deactivate')
  deactivate(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.keysService.deactivate(req.user.sub, id);
  }

  @ApiOperation({ summary: 'List all keys' })
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.keysService.list(req.user.sub);
  }
}
