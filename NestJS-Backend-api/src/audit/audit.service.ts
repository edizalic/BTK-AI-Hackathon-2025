import { Injectable, Logger } from '@nestjs/common';
import { AuditLog } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logActivity(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
          newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  async logSystemEvent(
    action: string,
    details: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logActivity(
      null,
      action,
      'system',
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent,
    );
  }

  async getActivityLogs(filters: AuditFiltersDto = {}): Promise<AuditLog[]> {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = {
        contains: filters.action,
        mode: 'insensitive',
      };
    }

    if (filters.resource) {
      where.resource = filters.resource;
    }

    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }

    if (filters.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }

  async generateAuditReport(filters: AuditFiltersDto = {}): Promise<{
    summary: {
      totalActivities: number;
      uniqueUsers: number;
      mostCommonActions: Array<{ action: string; count: number }>;
      activityByDate: Array<{ date: string; count: number }>;
    };
    activities: AuditLog[];
  }> {
    try {
      const activities = await this.getActivityLogs({
        ...filters,
        limit: filters.limit || 1000,
      });

      // Calculate summary statistics
      const totalActivities = activities.length;
      const uniqueUsers = new Set(activities.filter(a => a.userId).map(a => a.userId)).size;

      // Most common actions
      const actionCounts = activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Activity by date
      const dateGroups = activities.reduce((acc, activity) => {
        const date = activity.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activityByDate = Object.entries(dateGroups)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        summary: {
          totalActivities,
          uniqueUsers,
          mostCommonActions,
          activityByDate,
        },
        activities,
      };
    } catch (error) {
      this.logger.error('Error generating audit report:', error);
      throw error;
    }
  }

  async getSecurityEvents(filters: AuditFiltersDto = {}): Promise<AuditLog[]> {
    const securityActions = [
      'login',
      'logout',
      'failed_login',
      'password_change',
      'account_locked',
      'account_unlocked',
      'permission_denied',
      'unauthorized_access',
    ];

    return this.getActivityLogs({
      ...filters,
      // This would need to be implemented as a proper filter
    });
  }

  async getUserActivitySummary(userId: string, days: number = 30): Promise<{
    totalActivities: number;
    actionBreakdown: Array<{ action: string; count: number }>;
    mostActiveDay: string;
    averageActivitiesPerDay: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await this.getActivityLogs({
        userId,
        startDate: startDate.toISOString(),
        limit: 10000,
      });

      const totalActivities = activities.length;

      // Action breakdown
      const actionCounts = activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const actionBreakdown = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count);

      // Most active day
      const dayGroups = activities.reduce((acc, activity) => {
        const date = activity.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostActiveDay = Object.entries(dayGroups)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

      const averageActivitiesPerDay = totalActivities / days;

      return {
        totalActivities,
        actionBreakdown,
        mostActiveDay,
        averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error getting user activity summary for ${userId}:`, error);
      throw error;
    }
  }

  async cleanupOldLogs(olderThanDays: number = 365): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} audit logs older than ${olderThanDays} days`);
      
      return { deletedCount: result.count };
    } catch (error) {
      this.logger.error('Error cleaning up old audit logs:', error);
      throw error;
    }
  }
}