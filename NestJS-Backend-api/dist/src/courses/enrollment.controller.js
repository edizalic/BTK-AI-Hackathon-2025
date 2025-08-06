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
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const enrollment_service_1 = require("./enrollment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const bulk_enroll_students_dto_1 = require("./dto/bulk-enroll-students.dto");
let EnrollmentController = class EnrollmentController {
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    async enrollStudent(courseId, studentId, user) {
        return this.enrollmentService.enrollStudent(courseId, studentId, user.id);
    }
    async getCourseEnrollments(courseId) {
        return this.enrollmentService.getEnrollmentsByCourse(courseId);
    }
    async getStudentEnrollments(studentId) {
        return this.enrollmentService.getEnrollmentsByStudent(studentId);
    }
    async bulkEnrollStudents(courseId, dto, user) {
        return this.enrollmentService.bulkEnrollStudents(courseId, dto.studentIds, user.id);
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Post)('courses/:courseId/students/:studentId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll student in course (supervisors only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student enrolled successfully' }),
    (0, audit_log_decorator_1.AuditLog)('ENROLL_STUDENT'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "enrollStudent", null);
__decorate([
    (0, common_1.Get)('courses/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course enrollments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollments retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getCourseEnrollments", null);
__decorate([
    (0, common_1.Get)('students/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student enrollments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollments retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getStudentEnrollments", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/bulk-enroll'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk enroll students in course (supervisors only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Students enrolled successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                enrolled: {
                    type: 'array',
                    items: { type: 'object' }
                },
                skipped: {
                    type: 'array',
                    items: { type: 'string' }
                },
                message: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid student IDs or course not found' }),
    (0, audit_log_decorator_1.AuditLog)('BULK_ENROLL_STUDENTS'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_enroll_students_dto_1.BulkEnrollStudentsDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "bulkEnrollStudents", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('Enrollment'),
    (0, common_1.Controller)('enrollment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map