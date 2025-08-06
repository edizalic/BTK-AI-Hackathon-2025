import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('System')
@Controller('system')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSystemSettings() {
    return this.systemService.getSystemSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @AuditLog('UPDATE_SYSTEM_SETTINGS')
  async updateSystemSettings(@Body() settings: any) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const result = await this.systemService.updateSystemSetting(
        key,
        String(value),
      );
      results.push(result);
    }
    return results;
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getSystemHealth() {
    return this.systemService.getSystemHealth();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Generate system reports' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async generateSystemReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.systemService.generateSystemReport(start, end);
  }
}