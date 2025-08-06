import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateSupervisorDto } from '../users/dto/create-supervisor.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('supervisors')
  @ApiOperation({ summary: 'Register a new supervisor teacher (admins only)' })
  @ApiResponse({ status: 201, description: 'Supervisor registered successfully' })
  @AuditLog('REGISTER_SUPERVISOR')
  async registerSupervisor(
    @Body() createSupervisorDto: CreateSupervisorDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.adminService.registerSupervisor(createSupervisorDto, user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}