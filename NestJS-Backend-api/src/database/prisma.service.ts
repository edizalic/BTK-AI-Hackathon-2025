import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    // Event logging commented out due to typing issues
    // TODO: Fix Prisma event handler typing in future versions
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const modelNames = [
      'session',
      'auditLog',
      'systemSetting',
      'notification',
      'pageConfiguration',
      'fileAttachment',
      'advisoryAssignment',
      'teacherCourseAssignment',
      'studentAttendance',
      'classSession',
      'courseAnnouncement',
      'quizAttempt',
      'quiz',
      'courseMaterial',
      'grade',
      'assignmentSubmission',
      'assignment',
      'enrollment',
      'course',
      'department',
      'rolePermission',
      'permission',
      'userActivity',
      'userProfile',
      'user',
    ];

    for (const modelName of modelNames) {
      await this.$executeRawUnsafe(`DELETE FROM "${modelName}";`);
    }
  }

  async resetSequences(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot reset sequences in production');
    }

    // This would reset auto-increment sequences if using integer IDs
    // Since we're using cuid(), this might not be necessary
    // But keeping it here for future use
  }
}