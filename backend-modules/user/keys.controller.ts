import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ActivateAccountDto } from './auth.dto';
import { UserKeysService } from './keys.service';

@ApiTags('User Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user/keys')
export class UserKeysController {
  constructor(private readonly keysService: UserKeysService) {}

  @ApiOperation({ summary: 'Validate and consume serial key' })
  @Post('activate')
  activate(@Req() req: { user: { sub: string } }, @Body() dto: ActivateAccountDto) {
    return this.keysService.validateAndConsume(req.user.sub, dto.serialKey);
  }
}
