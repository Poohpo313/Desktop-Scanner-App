import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UploadDocumentDto } from './documents.dto';
import { UserDocumentsService } from './documents.service';

@ApiTags('User Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user/documents')
export class UserDocumentsController {
  constructor(private readonly documentsService: UserDocumentsService) {}

  @ApiOperation({ summary: 'Upload scanned document' })
  @Post('upload')
  upload(@Req() req: { user: { sub: string } }, @Body() dto: UploadDocumentDto) {
    return this.documentsService.upload(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'List own documents' })
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.documentsService.list(req.user.sub);
  }

  @ApiOperation({ summary: 'Soft delete own document' })
  @Delete(':id')
  softDelete(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.documentsService.softDelete(req.user.sub, id);
  }
}
