import { Notification, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificationGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
export declare class NotificationsService {
    private readonly prisma;
    private readonly notificationGateway;
    private readonly logger;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    createNotification(dto: CreateNotificationDto): Promise<Notification>;
    sendToUser(userId: string, notification: Omit<CreateNotificationDto, 'userId'>): Promise<Notification>;
    sendToRole(role: UserRole, notification: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]>;
    sendToCourse(courseId: string, notification: Omit<CreateNotificationDto, 'userId' | 'courseId'>): Promise<Notification[]>;
    getUserNotifications(userId: string, filters?: NotificationFiltersDto): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    notifyAssignmentDue(assignmentId: string, hoursBeforeDue?: number): Promise<void>;
    notifyGradePosted(gradeId: string): Promise<void>;
}
