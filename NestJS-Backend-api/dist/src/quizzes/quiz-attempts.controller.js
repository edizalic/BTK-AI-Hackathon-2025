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
exports.QuizAttemptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const quiz_attempts_service_1 = require("./quiz-attempts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
class SubmitQuizAnswersDto {
}
let QuizAttemptsController = class QuizAttemptsController {
    constructor(quizAttemptsService) {
        this.quizAttemptsService = quizAttemptsService;
    }
    async startAttempt(quizId, user) {
        return this.quizAttemptsService.startQuizAttempt(quizId, user.id);
    }
    async submitAttempt(attemptId, submitDto, user) {
        return this.quizAttemptsService.submitQuizAttempt(attemptId, submitDto.answers, user.id);
    }
    async getMyAttempts(quizId, user) {
        return this.quizAttemptsService.getStudentAttempts(quizId, user.id);
    }
    async getAttempt(attemptId, user) {
        return this.quizAttemptsService.getAttemptById(attemptId, user.id);
    }
};
exports.QuizAttemptsController = QuizAttemptsController;
__decorate([
    (0, common_1.Post)('start/:quizId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Start a quiz attempt' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quiz attempt started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot start quiz attempt' }),
    (0, audit_log_decorator_1.AuditLog)('START_QUIZ_ATTEMPT'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "startAttempt", null);
__decorate([
    (0, common_1.Post)(':attemptId/submit'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit quiz attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz attempt submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot submit quiz attempt' }),
    (0, audit_log_decorator_1.AuditLog)('SUBMIT_QUIZ_ATTEMPT'),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmitQuizAnswersDto, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)('quiz/:quizId/my-attempts'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get my quiz attempts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz attempts retrieved successfully' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "getMyAttempts", null);
__decorate([
    (0, common_1.Get)(':attemptId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz attempt by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz attempt retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "getAttempt", null);
exports.QuizAttemptsController = QuizAttemptsController = __decorate([
    (0, swagger_1.ApiTags)('Quiz Attempts'),
    (0, common_1.Controller)('quiz-attempts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [quiz_attempts_service_1.QuizAttemptsService])
], QuizAttemptsController);
//# sourceMappingURL=quiz-attempts.controller.js.map