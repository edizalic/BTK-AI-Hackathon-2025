import { NotificationsService } from './notifications.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(user: UserWithProfile, filters: NotificationFiltersDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        courseId: string | null;
        assignmentId: string | null;
        gradeId: string | null;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        isRead: boolean;
        readAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getUnreadCount(user: UserWithProfile): Promise<{
        count: number;
    }>;
    markAsRead(notificationId: string, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        courseId: string | null;
        assignmentId: string | null;
        gradeId: string | null;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        isRead: boolean;
        readAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markAllAsRead(user: UserWithProfile): Promise<{
        count: number;
    }>;
    deleteNotification(notificationId: string, user: UserWithProfile): Promise<{
        message: string;
    }>;
}
