import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UserSettingsService } from './settings.service';

@ApiTags('User Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user/settings')
export class UserSettingsController {
  constructor(private readonly settingsService: UserSettingsService) {}

  @ApiOperation({ summary: 'Get own account settings' })
  @Get()
  get(@Req() req: { user: { sub: string } }) {
    return this.settingsService.getSettings(req.user.sub);
  }

  @ApiOperation({ summary: 'Update own account settings' })
  @Patch()
  update(@Req() req: { user: { sub: string } }, @Body() payload: { locale?: string; timezone?: string; darkMode?: boolean }) {
    return this.settingsService.updateSettings(req.user.sub, payload);
  }
}
