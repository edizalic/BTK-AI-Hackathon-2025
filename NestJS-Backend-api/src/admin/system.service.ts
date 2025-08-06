import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemSetting(key: string, value: string, type: string = 'string') {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type },
    });
  }

  async getSystemHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Get basic stats
      const [userCount, courseCount, assignmentCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.assignment.count(),
      ]);

      return {
        status: 'healthy',
        database: 'connected',
        statistics: {
          users: userCount,
          courses: courseCount,
          assignments: assignmentCount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('System health check failed:', error);
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateSystemReport(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    } : {};

    const [users, courses, assignments, activities] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.course.count({ where: dateFilter }),
      this.prisma.assignment.count({ where: dateFilter }),
      this.prisma.userActivity.count({ where: dateFilter }),
    ]);

    return {
      period: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      },
      summary: {
        newUsers: users,
        newCourses: courses,
        newAssignments: assignments,
        totalActivities: activities,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}