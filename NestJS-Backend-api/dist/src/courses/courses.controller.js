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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const courses_service_1 = require("./courses.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const study_plan_dto_1 = require("./dto/study-plan.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
let CoursesController = class CoursesController {
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async createCourse(createCourseDto, user) {
        return this.coursesService.createCourse(createCourseDto, user.id);
    }
    async findAll(filters) {
        return this.coursesService.findAll(filters);
    }
    async findOne(id) {
        return this.coursesService.findById(id);
    }
    async getCoursesByInstructor(teacherId) {
        return this.coursesService.getCoursesByInstructor(teacherId);
    }
    async getCoursesByStudent(studentId) {
        return this.coursesService.getCoursesByStudent(studentId);
    }
    async createStudyPlan(courseId, createStudyPlanDto, user) {
        return this.coursesService.createStudyPlan(courseId, createStudyPlanDto, user.id);
    }
    async getStudyPlan(courseId) {
        return this.coursesService.getStudyPlan(courseId);
    }
    async updateStudyPlan(courseId, updateStudyPlanDto, user) {
        return this.coursesService.updateStudyPlan(courseId, updateStudyPlanDto, user.id);
    }
    async deleteStudyPlan(courseId, user) {
        return this.coursesService.deleteStudyPlan(courseId, user.id);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new course (supervisors only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Course created successfully' }),
    (0, audit_log_decorator_1.AuditLog)('CREATE_COURSE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all courses with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('instructor/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courses by instructor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses retrieved successfully' }),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByInstructor", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courses by student' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByStudent", null);
__decorate([
    (0, common_1.Post)(':courseId/study-plan'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create study plan for a course' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Study plan created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - only course instructor or creator can create study plan' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    (0, audit_log_decorator_1.AuditLog)('CREATE_STUDY_PLAN'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, study_plan_dto_1.CreateStudyPlanDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createStudyPlan", null);
__decorate([
    (0, common_1.Get)(':courseId/study-plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Get study plan for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Study plan retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getStudyPlan", null);
__decorate([
    (0, common_1.Put)(':courseId/study-plan'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update study plan for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Study plan updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - only course instructor or creator can update study plan' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_STUDY_PLAN'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, study_plan_dto_1.UpdateStudyPlanDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateStudyPlan", null);
__decorate([
    (0, common_1.Delete)(':courseId/study-plan'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete study plan for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Study plan deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - only course instructor or creator can delete study plan' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    (0, audit_log_decorator_1.AuditLog)('DELETE_STUDY_PLAN'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteStudyPlan", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)('Courses'),
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map