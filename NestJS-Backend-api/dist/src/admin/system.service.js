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
var SystemService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let SystemService = SystemService_1 = class SystemService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SystemService_1.name);
    }
    async getSystemSettings() {
        return this.prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }
    async updateSystemSetting(key, value, type = 'string') {
        return this.prisma.systemSetting.upsert({
            where: { key },
            update: { value, type },
            create: { key, value, type },
        });
    }
    async getSystemHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
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
        }
        catch (error) {
            this.logger.error('System health check failed:', error);
            return {
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async generateSystemReport(startDate, endDate) {
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
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = SystemService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
//# sourceMappingURL=system.service.js.map