import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditFiltersDto } from './dto/audit-filters.dto';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR_TEACHER)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get activity logs (admin/supervisors)' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully' })
  async getActivityLogs(@Query() filters: AuditFiltersDto) {
    return this.auditService.getActivityLogs(filters);
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate audit report (admin/supervisors)' })
  @ApiResponse({ status: 200, description: 'Audit report generated successfully' })
  async generateAuditReport(@Query() filters: AuditFiltersDto) {
    return this.auditService.generateAuditReport(filters);
  }

  @Get('security-events')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get security events (admins only)' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  async getSecurityEvents(@Query() filters: AuditFiltersDto) {
    return this.auditService.getSecurityEvents(filters);
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get user activity summary (admin/supervisors)' })
  @ApiResponse({ status: 200, description: 'User activity summary retrieved successfully' })
  async getUserActivitySummary(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.auditService.getUserActivitySummary(userId, daysNum);
  }

  @Delete('logs/cleanup')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cleanup old audit logs (admins only)' })
  @ApiResponse({ status: 200, description: 'Old logs cleaned up successfully' })
  async cleanupOldLogs(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 365;
    return this.auditService.cleanupOldLogs(daysNum);
  }
}