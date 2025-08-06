import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

@ApiTags('Pages')
@Controller('pages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get page configuration by ID' })
  @ApiResponse({ status: 200, description: 'Page configuration retrieved successfully' })
  async getPageConfig(
    @Param('id') pageId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.pagesService.getPageConfig(pageId, user.role as UserRole);
  }

  @Get()
  @ApiOperation({ summary: 'Get available pages for current user' })
  @ApiResponse({ status: 200, description: 'Available pages retrieved successfully' })
  async getAvailablePages(@CurrentUser() user: UserWithProfile) {
    return this.pagesService.getAvailablePages(user.role as UserRole);
  }
}