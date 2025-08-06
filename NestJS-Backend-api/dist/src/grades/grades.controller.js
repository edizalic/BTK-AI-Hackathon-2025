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
exports.GradesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const grades_service_1 = require("./grades.service");
const grade_calculation_service_1 = require("./grade-calculation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const create_grade_dto_1 = require("./dto/create-grade.dto");
const update_grade_dto_1 = require("./dto/update-grade.dto");
const grade_filters_dto_1 = require("./dto/grade-filters.dto");
let GradesController = class GradesController {
    constructor(gradesService, gradeCalculationService) {
        this.gradesService = gradesService;
        this.gradeCalculationService = gradeCalculationService;
    }
    async gradeAssignment(submissionId, createGradeDto, user) {
        return this.gradesService.gradeAssignment(submissionId, createGradeDto, user.id);
    }
    async getStudentGrades(studentId, filters) {
        return this.gradesService.getGradesByStudent(studentId, filters);
    }
    async getCourseGrades(courseId) {
        return this.gradesService.getGradesByCourse(courseId);
    }
    async updateGrade(gradeId, updateGradeDto, user) {
        return this.gradesService.updateGrade(gradeId, updateGradeDto, user.id);
    }
    async calculateStudentGPA(studentId, semester, year) {
        const yearNum = year ? parseInt(year) : undefined;
        const gpa = await this.gradeCalculationService.calculateGPA(studentId, semester, yearNum);
        return {
            studentId,
            gpa,
            semester,
            year: yearNum,
            calculatedAt: new Date().toISOString(),
        };
    }
    async generateGradeReport(studentId, semester, year) {
        const yearNum = year ? parseInt(year) : undefined;
        return this.gradesService.generateGradeReport(studentId, semester, yearNum);
    }
    async getStudentTranscript(studentId) {
        return this.gradeCalculationService.getStudentTranscript(studentId);
    }
    async getCourseStatistics(courseId) {
        return this.gradeCalculationService.calculateCourseGrades(courseId);
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Post)('submissions/:submissionId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Grade assignment submission (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Grade created successfully' }),
    (0, audit_log_decorator_1.AuditLog)('GRADE_ASSIGNMENT'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_grade_dto_1.CreateGradeDto, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "gradeAssignment", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student grades' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student grades retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grade_filters_dto_1.GradeFiltersDto]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getStudentGrades", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get course grades (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course grades retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getCourseGrades", null);
__decorate([
    (0, common_1.Put)(':gradeId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update grade' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grade updated successfully' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_GRADE'),
    __param(0, (0, common_1.Param)('gradeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_grade_dto_1.UpdateGradeDto, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "updateGrade", null);
__decorate([
    (0, common_1.Get)('student/:studentId/gpa'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate student GPA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'GPA calculated successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('semester')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "calculateStudentGPA", null);
__decorate([
    (0, common_1.Get)('student/:studentId/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate student grade report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grade report generated successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('semester')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "generateGradeReport", null);
__decorate([
    (0, common_1.Get)('student/:studentId/transcript'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student transcript' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transcript retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getStudentTranscript", null);
__decorate([
    (0, common_1.Get)('course/:courseId/statistics'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get course grade statistics (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getCourseStatistics", null);
exports.GradesController = GradesController = __decorate([
    (0, swagger_1.ApiTags)('Grades'),
    (0, common_1.Controller)('grades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [grades_service_1.GradesService,
        grade_calculation_service_1.GradeCalculationService])
], GradesController);
//# sourceMappingURL=grades.controller.js.map