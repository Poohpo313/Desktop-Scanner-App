import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UserSearchService } from './search.service';

@ApiTags('User Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user/search')
export class UserSearchController {
  constructor(private readonly searchService: UserSearchService) {}

  @ApiOperation({ summary: 'Full-text search in OCR content' })
  @Get()
  search(@Req() req: { user: { sub: string } }, @Query('q') q: string) {
    return this.searchService.searchByOcr(req.user.sub, q);
  }
}
