import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ChangePinDto, PinLoginDto } from './auth.dto';
import { SuperAdminAuthService } from './auth.service';

@ApiTags('Super Admin Auth')
@Controller('api/super-admin/auth')
export class SuperAdminAuthController {
  constructor(private readonly authService: SuperAdminAuthService) {}

  @ApiOperation({ summary: 'PIN-based login' })
  @Post('login')
  login(@Body() dto: PinLoginDto) {
    return this.authService.loginWithPin(dto.pin);
  }

  @ApiOperation({ summary: 'Forgot access flow' })
  @Post('forgot-access')
  forgot(@Body('identifier') identifier: string) {
    return this.authService.forgotAccess(identifier);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: { user: { sub: string } }) {
    return this.authService.logout(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh token' })
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req: { user: { sub: string } }) {
    return this.authService.refresh(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change super-admin PIN' })
  @UseGuards(JwtAuthGuard)
  @Post('change-pin')
  changePin(@Req() req: { user: { sub: string } }, @Body() dto: ChangePinDto) {
    return this.authService.changePin(req.user.sub, dto.oldPin, dto.newPin);
  }
}
