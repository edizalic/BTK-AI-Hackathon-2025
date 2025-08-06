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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const users_service_1 = require("../users/users.service");
let AdminService = AdminService_1 = class AdminService {
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async registerSupervisor(dto, adminId) {
        return this.usersService.createSupervisor(dto, adminId);
    }
    async getSystemStats() {
        const [userStats, courseStats, assignmentStats] = await Promise.all([
            this.usersService.getUserStats(),
            this.getCourseStats(),
            this.getAssignmentStats(),
        ]);
        return {
            users: userStats,
            courses: courseStats,
            assignments: assignmentStats,
            timestamp: new Date().toISOString(),
        };
    }
    async getCourseStats() {
        const [total, active, completed] = await Promise.all([
            this.prisma.course.count(),
            this.prisma.course.count({ where: { status: 'ACTIVE' } }),
            this.prisma.course.count({ where: { status: 'COMPLETED' } }),
        ]);
        return { total, active, completed };
    }
    async getAssignmentStats() {
        const [total, assigned, submitted, graded] = await Promise.all([
            this.prisma.assignment.count(),
            this.prisma.assignment.count({ where: { status: 'ASSIGNED' } }),
            this.prisma.assignment.count({ where: { status: 'SUBMITTED' } }),
            this.prisma.assignment.count({ where: { status: 'GRADED' } }),
        ]);
        return { total, assigned, submitted, graded };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], AdminService);
//# sourceMappingURL=admin.service.js.map