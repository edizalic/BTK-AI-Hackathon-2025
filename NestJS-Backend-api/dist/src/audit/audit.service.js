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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async logActivity(userId, action, resource, resourceId, oldValues, newValues, ipAddress, userAgent) {
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
        }
        catch (error) {
            this.logger.error('Error creating audit log:', error);
            throw error;
        }
    }
    async logSystemEvent(action, details, ipAddress, userAgent) {
        return this.logActivity(null, action, 'system', undefined, undefined, details, ipAddress, userAgent);
    }
    async getActivityLogs(filters = {}) {
        const where = {};
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
    async generateAuditReport(filters = {}) {
        try {
            const activities = await this.getActivityLogs({
                ...filters,
                limit: filters.limit || 1000,
            });
            const totalActivities = activities.length;
            const uniqueUsers = new Set(activities.filter(a => a.userId).map(a => a.userId)).size;
            const actionCounts = activities.reduce((acc, activity) => {
                acc[activity.action] = (acc[activity.action] || 0) + 1;
                return acc;
            }, {});
            const mostCommonActions = Object.entries(actionCounts)
                .map(([action, count]) => ({ action, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const dateGroups = activities.reduce((acc, activity) => {
                const date = activity.createdAt.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
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
        }
        catch (error) {
            this.logger.error('Error generating audit report:', error);
            throw error;
        }
    }
    async getSecurityEvents(filters = {}) {
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
        });
    }
    async getUserActivitySummary(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const activities = await this.getActivityLogs({
                userId,
                startDate: startDate.toISOString(),
                limit: 10000,
            });
            const totalActivities = activities.length;
            const actionCounts = activities.reduce((acc, activity) => {
                acc[activity.action] = (acc[activity.action] || 0) + 1;
                return acc;
            }, {});
            const actionBreakdown = Object.entries(actionCounts)
                .map(([action, count]) => ({ action, count }))
                .sort((a, b) => b.count - a.count);
            const dayGroups = activities.reduce((acc, activity) => {
                const date = activity.createdAt.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
            const mostActiveDay = Object.entries(dayGroups)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
            const averageActivitiesPerDay = totalActivities / days;
            return {
                totalActivities,
                actionBreakdown,
                mostActiveDay,
                averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error(`Error getting user activity summary for ${userId}:`, error);
            throw error;
        }
    }
    async cleanupOldLogs(olderThanDays = 365) {
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
        }
        catch (error) {
            this.logger.error('Error cleaning up old audit logs:', error);
            throw error;
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map