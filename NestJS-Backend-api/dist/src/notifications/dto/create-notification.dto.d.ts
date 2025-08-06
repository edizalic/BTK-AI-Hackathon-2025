import { NotificationType, NotificationPriority } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    courseId?: string;
    assignmentId?: string;
    gradeId?: string;
    metadata?: any;
}
