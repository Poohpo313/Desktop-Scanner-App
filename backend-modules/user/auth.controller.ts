import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ActivateAccountDto, LoginDto } from './auth.dto';
import { UserAuthService } from './auth.service';

@ApiTags('User Auth')
@Controller('api/user/auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: { user: { sub: string } }) {
    return this.authService.logout(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req: { user: { sub: string } }) {
    return this.authService.refresh(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate account using serial key' })
  @UseGuards(JwtAuthGuard)
  @Post('activate')
  activate(@Req() req: { user: { sub: string } }, @Body() dto: ActivateAccountDto) {
    return this.authService.activateAccount(req.user.sub, dto.serialKey);
  }
}
