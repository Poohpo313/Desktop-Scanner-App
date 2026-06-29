import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AdminLoginDto } from './auth.dto';
import { AdminAuthService } from './auth.service';

@ApiTags('Admin Auth')
@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto.username);
  }

  @ApiOperation({ summary: 'Forgot credentials flow' })
  @Post('forgot-credentials')
  forgot(@Body('identifier') identifier: string) {
    return this.authService.forgotCredentials(identifier);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: { user: { sub: string } }) {
    return this.authService.logout(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh admin token' })
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req: { user: { sub: string } }) {
    return this.authService.refresh(req.user.sub);
  }
}
