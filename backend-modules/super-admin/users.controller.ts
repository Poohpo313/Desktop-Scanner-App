import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SuperAdminUsersService } from './users.service';

@ApiTags('Super Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/users')
export class SuperAdminUsersController {
  constructor(private readonly usersService: SuperAdminUsersService) {}

  @ApiOperation({ summary: 'List all users (unscoped)' })
  @Get()
  list() {
    return this.usersService.listAll();
  }

  @ApiOperation({ summary: 'Accept/reject cloud verification' })
  @Patch(':id/cloud-verification')
  verify(@Param('id') id: string, @Body('approved') approved: boolean) {
    return this.usersService.setCloudVerification(id, approved);
  }
}
