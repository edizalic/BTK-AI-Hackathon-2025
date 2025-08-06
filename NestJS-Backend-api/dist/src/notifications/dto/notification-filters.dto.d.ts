import { NotificationType, NotificationPriority } from '@prisma/client';
export declare class NotificationFiltersDto {
    isRead?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    limit?: number;
    offset?: number;
}
