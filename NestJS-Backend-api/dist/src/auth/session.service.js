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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
let SessionService = SessionService_1 = class SessionService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(SessionService_1.name);
    }
    async createSession(createSessionDto) {
        const sessionTimeoutHours = this.configService.get('security.sessionTimeout');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + sessionTimeoutHours);
        return this.prisma.session.create({
            data: {
                userId: createSessionDto.userId,
                token: createSessionDto.token,
                expiresAt,
                ipAddress: createSessionDto.ipAddress,
                userAgent: createSessionDto.userAgent,
            },
        });
    }
    async findActiveSession(token) {
        return this.prisma.session.findFirst({
            where: {
                token,
                isActive: true,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });
    }
    async invalidateSession(token) {
        await this.prisma.session.updateMany({
            where: { token },
            data: { isActive: false },
        });
    }
    async invalidateAllUserSessions(userId) {
        await this.prisma.session.updateMany({
            where: { userId },
            data: { isActive: false },
        });
    }
    async getUserActiveSessions(userId) {
        return this.prisma.session.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async extendSession(token) {
        const sessionTimeoutHours = this.configService.get('security.sessionTimeout');
        const newExpiresAt = new Date();
        newExpiresAt.setHours(newExpiresAt.getHours() + sessionTimeoutHours);
        await this.prisma.session.updateMany({
            where: {
                token,
                isActive: true,
            },
            data: {
                expiresAt: newExpiresAt,
            },
        });
    }
    async cleanupExpiredSessions() {
        try {
            const result = await this.prisma.session.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { isActive: false },
                    ],
                },
            });
            if (result.count > 0) {
                this.logger.log(`Cleaned up ${result.count} expired sessions`);
            }
        }
        catch (error) {
            this.logger.error('Error cleaning up expired sessions:', error);
        }
    }
    async getSessionStats(userId) {
        const where = userId ? { userId } : {};
        const now = new Date();
        const [total, active, expired] = await Promise.all([
            this.prisma.session.count({ where }),
            this.prisma.session.count({
                where: {
                    ...where,
                    isActive: true,
                    expiresAt: { gte: now },
                },
            }),
            this.prisma.session.count({
                where: {
                    ...where,
                    OR: [
                        { isActive: false },
                        { expiresAt: { lt: now } },
                    ],
                },
            }),
        ]);
        return { total, active, expired };
    }
    async findActiveSessionByUserId(userId) {
        return this.prisma.session.findFirst({
            where: {
                userId,
                isActive: true,
                expiresAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateSessionToken(sessionId, newAccessToken) {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { token: newAccessToken },
        });
    }
};
exports.SessionService = SessionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionService.prototype, "cleanupExpiredSessions", null);
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SessionService);
//# sourceMappingURL=session.service.js.map