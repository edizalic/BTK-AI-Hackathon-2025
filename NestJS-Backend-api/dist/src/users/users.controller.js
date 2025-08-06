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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const create_student_dto_1 = require("./dto/create-student.dto");
const create_teacher_dto_1 = require("./dto/create-teacher.dto");
const create_supervisor_dto_1 = require("./dto/create-supervisor.dto");
const user_filters_dto_1 = require("./dto/user-filters.dto");
const assign_advisory_dto_1 = require("./dto/assign-advisory.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createStudent(createStudentDto, user) {
        return this.usersService.createStudent(createStudentDto, user.id);
    }
    async createTeacher(createTeacherDto, user) {
        return this.usersService.createTeacher(createTeacherDto, user.id);
    }
    async createSupervisor(createSupervisorDto, user) {
        return this.usersService.createSupervisor(createSupervisorDto, user.id);
    }
    async findAll(filters) {
        return this.usersService.findAll(filters);
    }
    async findOne(id) {
        return this.usersService.findById(id);
    }
    async assignAdvisoryTeacher(studentId, assignAdvisoryDto, user) {
        return this.usersService.assignAdvisoryTeacher({ ...assignAdvisoryDto, studentId }, user.id);
    }
    async getUserStats() {
        return this.usersService.getUserStats();
    }
    async resetUserPassword(userId, resetPasswordDto, supervisor) {
        return this.usersService.resetUserPassword(userId, resetPasswordDto.newPassword, supervisor.id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('students'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new student (supervisors only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student registered successfully' }),
    (0, audit_log_decorator_1.AuditLog)('REGISTER_STUDENT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_dto_1.CreateStudentDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Post)('teachers'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new teacher (supervisors only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Teacher registered successfully' }),
    (0, audit_log_decorator_1.AuditLog)('REGISTER_TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Post)('supervisors'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new supervisor (admins only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Supervisor registered successfully' }),
    (0, audit_log_decorator_1.AuditLog)('REGISTER_SUPERVISOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supervisor_dto_1.CreateSupervisorDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createSupervisor", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_filters_dto_1.UserFiltersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':studentId/advisory'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Assign advisory teacher to student' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advisory teacher assigned successfully' }),
    (0, audit_log_decorator_1.AuditLog)('ASSIGN_ADVISORY_TEACHER'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_advisory_dto_1.AssignAdvisoryDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignAdvisoryTeacher", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Put)(':userId/reset-password'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password for a student or teacher (supervisors only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot reset this user\'s password' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, audit_log_decorator_1.AuditLog)('RESET_USER_PASSWORD'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reset_password_dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetUserPassword", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map