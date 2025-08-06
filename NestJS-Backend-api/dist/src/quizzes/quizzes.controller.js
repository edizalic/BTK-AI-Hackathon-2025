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
exports.QuizzesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const quizzes_service_1 = require("./quizzes.service");
const quiz_attempts_service_1 = require("./quiz-attempts.service");
const create_quiz_dto_1 = require("./dto/create-quiz.dto");
const update_quiz_dto_1 = require("./dto/update-quiz.dto");
const submit_quiz_dto_1 = require("./dto/submit-quiz.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
let QuizzesController = class QuizzesController {
    constructor(quizzesService, quizAttemptsService) {
        this.quizzesService = quizzesService;
        this.quizAttemptsService = quizAttemptsService;
    }
    async create(createQuizDto, user) {
        return this.quizzesService.createQuiz(createQuizDto, user.id);
    }
    async findByCourse(courseId) {
        return this.quizzesService.getQuizzesByCourse(courseId);
    }
    async findOne(id) {
        return this.quizzesService.getQuizById(id);
    }
    async update(id, updateQuizDto, user) {
        return this.quizzesService.updateQuiz(id, updateQuizDto, user.id);
    }
    async remove(id, user) {
        return this.quizzesService.deleteQuiz(id, user.id);
    }
    async getAttempts(quizId, studentId) {
        return this.quizzesService.getQuizAttempts(quizId, studentId);
    }
    async getQuizForStudent(id, user) {
        return this.quizzesService.getQuizForStudent(id, user.id);
    }
    async getQuizForTeacher(id, user) {
        return this.quizzesService.getQuizForTeacher(id, user.id);
    }
    async submitQuiz(quizId, submitDto, user) {
        const attempt = await this.quizAttemptsService.startQuizAttempt(quizId, user.id);
        return this.quizzesService.gradeQuizAttempt(attempt.id, submitDto.answers);
    }
    async getStudentWrongAnswers(studentId, user) {
        if (user.role === client_1.UserRole.STUDENT && user.id !== studentId) {
            throw new common_1.BadRequestException('You can only access your own wrong answers');
        }
        return this.quizzesService.getStudentWrongAnswers(studentId);
    }
    async getStudentAllAttempts(studentId) {
        return this.quizzesService.getStudentAllQuizAttempts(studentId);
    }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new quiz' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quiz created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, audit_log_decorator_1.AuditLog)('CREATE_QUIZ'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quiz_dto_1.CreateQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quizzes for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quizzes retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_QUIZ'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quiz_dto_1.UpdateQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, audit_log_decorator_1.AuditLog)('DELETE_QUIZ'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/attempts'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz attempts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz attempts retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "getAttempts", null);
__decorate([
    (0, common_1.Get)(':id/student'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz for student (without correct answers)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz retrieved successfully for student' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not enrolled in course' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "getQuizForStudent", null);
__decorate([
    (0, common_1.Get)(':id/teacher'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz for teacher (with correct answers)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz retrieved successfully for teacher' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "getQuizForTeacher", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit quiz attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz submitted and graded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not eligible to take quiz' }),
    (0, audit_log_decorator_1.AuditLog)('SUBMIT_QUIZ'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_quiz_dto_1.SubmitQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "submitQuiz", null);
__decorate([
    (0, common_1.Get)('student/:studentId/wrong-answers'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get student wrong answers from all quizzes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wrong answers retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "getStudentWrongAnswers", null);
__decorate([
    (0, common_1.Get)('student/:studentId/attempts'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quiz attempts for a specific student' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student quiz attempts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User is not a student' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizzesController.prototype, "getStudentAllAttempts", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, swagger_1.ApiTags)('Quizzes'),
    (0, common_1.Controller)('quizzes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService,
        quiz_attempts_service_1.QuizAttemptsService])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map