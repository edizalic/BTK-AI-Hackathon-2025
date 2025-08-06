import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationType, NotificationPriority, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificationGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          title: dto.title,
          message: dto.message,
          type: dto.type,
          priority: dto.priority || NotificationPriority.NORMAL,
          courseId: dto.courseId,
          assignmentId: dto.assignmentId,
          gradeId: dto.gradeId,
          metadata: dto.metadata,
        },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });

      // Send real-time notification
      this.notificationGateway.sendNotificationToUser(dto.userId, notification);

      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendToUser(userId: string, notification: Omit<CreateNotificationDto, 'userId'>): Promise<Notification> {
    return this.createNotification({
      ...notification,
      userId,
    });
  }

  async sendToRole(role: UserRole, notification: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]> {
    try {
      // Get all users with the specified role
      const users = await this.prisma.user.findMany({
        where: { role, isActive: true },
        select: { id: true },
      });

      const notifications = await Promise.all(
        users.map(user => this.sendToUser(user.id, notification))
      );

      return notifications;
    } catch (error) {
      this.logger.error(`Error sending notification to role ${role}:`, error);
      throw error;
    }
  }

  async sendToCourse(courseId: string, notification: Omit<CreateNotificationDto, 'userId' | 'courseId'>): Promise<Notification[]> {
    try {
      // Get all enrolled students and the instructor
      const [enrollments, course] = await Promise.all([
        this.prisma.enrollment.findMany({
          where: { courseId, status: 'ACTIVE' },
          select: { studentId: true },
        }),
        this.prisma.course.findUnique({
          where: { id: courseId },
          select: { instructorId: true },
        }),
      ]);

      const userIds = new Set<string>();
      
      // Add students
      enrollments.forEach(enrollment => userIds.add(enrollment.studentId));
      
      // Add instructor
      if (course?.instructorId) {
        userIds.add(course.instructorId);
      }

      const notifications = await Promise.all(
        Array.from(userIds).map(userId => 
          this.sendToUser(userId, { ...notification, courseId })
        )
      );

      return notifications;
    } catch (error) {
      this.logger.error(`Error sending notification to course ${courseId}:`, error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, filters: NotificationFiltersDto = {}): Promise<Notification[]> {
    const where: any = { userId };

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // Automated notification methods
  async notifyAssignmentDue(assignmentId: string, hoursBeforeDue: number = 24): Promise<void> {
    try {
      const assignment = await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          course: {
            include: {
              enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                  student: true,
                },
              },
            },
          },
        },
      });

      if (!assignment) return;

      const dueDate = new Date(assignment.dueDate);
      const notificationTime = new Date(dueDate.getTime() - (hoursBeforeDue * 60 * 60 * 1000));

      if (new Date() >= notificationTime) {
        // Send notifications to all enrolled students
        await Promise.all(
          assignment.course.enrollments.map(enrollment =>
            this.sendToUser(enrollment.studentId, {
              title: 'Assignment Due Soon',
              message: `Assignment "${assignment.title}" is due in ${hoursBeforeDue} hours.`,
              type: NotificationType.ASSIGNMENT_DUE,
              priority: NotificationPriority.HIGH,
              courseId: assignment.courseId,
              assignmentId: assignment.id,
            })
          )
        );
      }
    } catch (error) {
      this.logger.error(`Error sending due date notifications for assignment ${assignmentId}:`, error);
    }
  }

  async notifyGradePosted(gradeId: string): Promise<void> {
    try {
      const grade = await this.prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
          student: true,
          assignment: true,
          course: true,
        },
      });

      if (!grade) return;

      await this.sendToUser(grade.studentId, {
        title: 'New Grade Posted',
        message: `Your grade for "${grade.assignment?.title || 'assignment'}" has been posted: ${grade.letterGrade}`,
        type: NotificationType.GRADE_POSTED,
        priority: NotificationPriority.NORMAL,
        courseId: grade.courseId,
        assignmentId: grade.assignmentId,
        gradeId: grade.id,
      });
    } catch (error) {
      this.logger.error(`Error sending grade notification for grade ${gradeId}:`, error);
    }
  }
}