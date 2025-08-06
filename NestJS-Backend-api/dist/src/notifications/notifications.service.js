"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, notificationGateway) {
        this.prisma = prisma;
        this.notificationGateway = notificationGateway;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async createNotification(dto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: dto.userId,
                    title: dto.title,
                    message: dto.message,
                    type: dto.type,
                    priority: dto.priority || client_1.NotificationPriority.NORMAL,
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
            this.notificationGateway.sendNotificationToUser(dto.userId, notification);
            return notification;
        }
        catch (error) {
            this.logger.error('Error creating notification:', error);
            throw error;
        }
    }
    async sendToUser(userId, notification) {
        return this.createNotification({
            ...notification,
            userId,
        });
    }
    async sendToRole(role, notification) {
        try {
            const users = await this.prisma.user.findMany({
                where: { role, isActive: true },
                select: { id: true },
            });
            const notifications = await Promise.all(users.map(user => this.sendToUser(user.id, notification)));
            return notifications;
        }
        catch (error) {
            this.logger.error(`Error sending notification to role ${role}:`, error);
            throw error;
        }
    }
    async sendToCourse(courseId, notification) {
        try {
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
            const userIds = new Set();
            enrollments.forEach(enrollment => userIds.add(enrollment.studentId));
            if (course?.instructorId) {
                userIds.add(course.instructorId);
            }
            const notifications = await Promise.all(Array.from(userIds).map(userId => this.sendToUser(userId, { ...notification, courseId })));
            return notifications;
        }
        catch (error) {
            this.logger.error(`Error sending notification to course ${courseId}:`, error);
            throw error;
        }
    }
    async getUserNotifications(userId, filters = {}) {
        const where = { userId };
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
    async markAsRead(notificationId, userId) {
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
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return { count: result.count };
    }
    async deleteNotification(notificationId, userId) {
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
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async notifyAssignmentDue(assignmentId, hoursBeforeDue = 24) {
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
            if (!assignment)
                return;
            const dueDate = new Date(assignment.dueDate);
            const notificationTime = new Date(dueDate.getTime() - (hoursBeforeDue * 60 * 60 * 1000));
            if (new Date() >= notificationTime) {
                await Promise.all(assignment.course.enrollments.map(enrollment => this.sendToUser(enrollment.studentId, {
                    title: 'Assignment Due Soon',
                    message: `Assignment "${assignment.title}" is due in ${hoursBeforeDue} hours.`,
                    type: client_1.NotificationType.ASSIGNMENT_DUE,
                    priority: client_1.NotificationPriority.HIGH,
                    courseId: assignment.courseId,
                    assignmentId: assignment.id,
                })));
            }
        }
        catch (error) {
            this.logger.error(`Error sending due date notifications for assignment ${assignmentId}:`, error);
        }
    }
    async notifyGradePosted(gradeId) {
        try {
            const grade = await this.prisma.grade.findUnique({
                where: { id: gradeId },
                include: {
                    student: true,
                    assignment: true,
                    course: true,
                },
            });
            if (!grade)
                return;
            await this.sendToUser(grade.studentId, {
                title: 'New Grade Posted',
                message: `Your grade for "${grade.assignment?.title || 'assignment'}" has been posted: ${grade.letterGrade}`,
                type: client_1.NotificationType.GRADE_POSTED,
                priority: client_1.NotificationPriority.NORMAL,
                courseId: grade.courseId,
                assignmentId: grade.assignmentId,
                gradeId: grade.id,
            });
        }
        catch (error) {
            this.logger.error(`Error sending grade notification for grade ${gradeId}:`, error);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map