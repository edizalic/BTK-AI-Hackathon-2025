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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const audit_filters_dto_1 = require("./dto/audit-filters.dto");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getActivityLogs(filters) {
        return this.auditService.getActivityLogs(filters);
    }
    async generateAuditReport(filters) {
        return this.auditService.generateAuditReport(filters);
    }
    async getSecurityEvents(filters) {
        return this.auditService.getSecurityEvents(filters);
    }
    async getUserActivitySummary(userId, days) {
        const daysNum = days ? parseInt(days) : 30;
        return this.auditService.getUserActivitySummary(userId, daysNum);
    }
    async cleanupOldLogs(days) {
        const daysNum = days ? parseInt(days) : 365;
        return this.auditService.cleanupOldLogs(daysNum);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs (admin/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_filters_dto_1.AuditFiltersDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getActivityLogs", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate audit report (admin/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit report generated successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_filters_dto_1.AuditFiltersDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "generateAuditReport", null);
__decorate([
    (0, common_1.Get)('security-events'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get security events (admins only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security events retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_filters_dto_1.AuditFiltersDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getSecurityEvents", null);
__decorate([
    (0, common_1.Get)('user/:userId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity summary (admin/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity summary retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserActivitySummary", null);
__decorate([
    (0, common_1.Delete)('logs/cleanup'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cleanup old audit logs (admins only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Old logs cleaned up successfully' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "cleanupOldLogs", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit'),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR_TEACHER),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map