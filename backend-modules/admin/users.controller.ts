import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { EditUserDto, RegisterUserDto } from './users.dto';
import { AdminUsersService } from './users.service';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @ApiOperation({ summary: 'List scoped users' })
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.usersService.list(req.user.sub);
  }

  @ApiOperation({ summary: 'Register scoped user' })
  @Post()
  register(@Req() req: { user: { sub: string } }, @Body() dto: RegisterUserDto) {
    return this.usersService.register(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Edit scoped user' })
  @Patch(':id')
  edit(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: EditUserDto) {
    return this.usersService.edit(req.user.sub, id, dto);
  }

  @ApiOperation({ summary: 'Soft delete scoped user' })
  @Delete(':id')
  softDelete(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.usersService.softDelete(req.user.sub, id);
  }

  @ApiOperation({ summary: 'Restore user from recycle bin' })
  @Patch(':id/restore')
  restore(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.usersService.restore(req.user.sub, id);
  }
}
