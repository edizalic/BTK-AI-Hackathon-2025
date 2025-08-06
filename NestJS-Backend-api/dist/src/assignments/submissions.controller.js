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
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "STUDENT";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["SUPERVISOR_TEACHER"] = "SUPERVISOR_TEACHER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
const submissions_service_1 = require("./submissions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const submit_assignment_dto_1 = require("./dto/submit-assignment.dto");
let SubmissionsController = class SubmissionsController {
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async submitAssignment(assignmentId, submitAssignmentDto, user) {
        return this.submissionsService.submitAssignment(assignmentId, user.id, submitAssignmentDto);
    }
    async getAssignmentSubmissions(assignmentId) {
        return this.submissionsService.getAssignmentSubmissions(assignmentId);
    }
    async getMySubmission(assignmentId, user) {
        return this.submissionsService.getSubmission(assignmentId, user.id);
    }
    async updateSubmission(assignmentId, submitAssignmentDto, user) {
        return this.submissionsService.updateSubmission(assignmentId, user.id, submitAssignmentDto);
    }
    async getStudentSubmissions(studentId) {
        return this.submissionsService.getStudentSubmissions(studentId);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)(':assignmentId/submit'),
    (0, roles_decorator_1.Roles)(UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit assignment (students only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Assignment submitted successfully' }),
    (0, audit_log_decorator_1.AuditLog)('SUBMIT_ASSIGNMENT'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_assignment_dto_1.SubmitAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "submitAssignment", null);
__decorate([
    (0, common_1.Get)(':assignmentId/submissions'),
    (0, roles_decorator_1.Roles)(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment submissions (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submissions retrieved successfully' }),
    __param(0, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getAssignmentSubmissions", null);
__decorate([
    (0, common_1.Get)(':assignmentId/submission'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user submission for assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission retrieved successfully' }),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getMySubmission", null);
__decorate([
    (0, common_1.Put)(':assignmentId/submission'),
    (0, roles_decorator_1.Roles)(UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Update assignment submission (students only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission updated successfully' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_SUBMISSION'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_assignment_dto_1.SubmitAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "updateSubmission", null);
__decorate([
    (0, common_1.Get)('student/:studentId/submissions'),
    (0, roles_decorator_1.Roles)(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get student submissions (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student submissions retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getStudentSubmissions", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, swagger_1.ApiTags)('Assignment Submissions'),
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map