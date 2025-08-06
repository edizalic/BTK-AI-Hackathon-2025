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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "STUDENT";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["SUPERVISOR_TEACHER"] = "SUPERVISOR_TEACHER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
const assignments_service_1 = require("./assignments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const update_assignment_dto_1 = require("./dto/update-assignment.dto");
const assignment_filters_dto_1 = require("./dto/assignment-filters.dto");
let AssignmentsController = class AssignmentsController {
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    async createAssignment(createAssignmentDto, user) {
        return this.assignmentsService.createAssignment(createAssignmentDto, user.id);
    }
    async findAll(filters) {
        return this.assignmentsService.findAll(filters);
    }
    async findOne(id) {
        return this.assignmentsService.findById(id);
    }
    async updateAssignment(id, updateAssignmentDto, user) {
        return this.assignmentsService.updateAssignment(id, updateAssignmentDto, user.id);
    }
    async deleteAssignment(id, user) {
        await this.assignmentsService.deleteAssignment(id, user.id);
        return { message: 'Assignment deleted successfully' };
    }
    async getAssignmentsByStudent(studentId) {
        return this.assignmentsService.getAssignmentsByStudent(studentId);
    }
    async getAssignmentsByCourse(courseId) {
        return this.assignmentsService.getAssignmentsByCourse(courseId);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create assignment (teachers/supervisors)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Assignment created successfully' }),
    (0, audit_log_decorator_1.AuditLog)('CREATE_ASSIGNMENT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_assignment_dto_1.CreateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all assignments with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignments retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assignment_filters_dto_1.AssignmentFiltersDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignment retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignment updated successfully' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_ASSIGNMENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_assignment_dto_1.UpdateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignment deleted successfully' }),
    (0, audit_log_decorator_1.AuditLog)('DELETE_ASSIGNMENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "deleteAssignment", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignments for a student' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student assignments retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getAssignmentsByStudent", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignments for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course assignments retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getAssignmentsByCourse", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignments'),
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map