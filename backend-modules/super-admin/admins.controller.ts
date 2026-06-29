import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { EditAdminDto, RegisterAdminDto } from './admins.dto';
import { SuperAdminAdminsService } from './admins.service';

@ApiTags('Super Admins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/super-admin/admins')
export class SuperAdminAdminsController {
  constructor(private readonly adminsService: SuperAdminAdminsService) {}

  @ApiOperation({ summary: 'List admins' })
  @Get()
  list() {
    return this.adminsService.list();
  }

  @ApiOperation({ summary: 'Create admin' })
  @Post()
  create(@Body() dto: RegisterAdminDto) {
    return this.adminsService.create(dto);
  }

  @ApiOperation({ summary: 'Edit admin' })
  @Patch(':id')
  edit(@Param('id') id: string, @Body() dto: EditAdminDto) {
    return this.adminsService.edit(id, dto);
  }

  @ApiOperation({ summary: 'Soft delete admin' })
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.adminsService.softDelete(id);
  }

  @ApiOperation({ summary: 'Permanent delete admin' })
  @Delete(':id/permanent')
  permanentDelete(@Param('id') id: string) {
    return this.adminsService.permanentDelete(id);
  }

  @ApiOperation({ summary: 'Restore admin' })
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.adminsService.restore(id);
  }
}
