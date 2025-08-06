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
exports.GeminiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gemini_service_1 = require("./gemini.service");
const gemini_dto_1 = require("./dto/gemini.dto");
let GeminiController = class GeminiController {
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async getWeeklyStudyPlan(courseId) {
        return await this.geminiService.getWeeklyStudyPlan(courseId);
    }
    async getQuiz(courseId, getQuizDto) {
        return await this.geminiService.getQuiz(courseId, getQuizDto.weeksToCover);
    }
    async getAssignment(courseId, getAssignmentDto) {
        return await this.geminiService.getAssignment(courseId, getAssignmentDto.weeksToCover);
    }
    async askQuizQuestion(courseId, askQuizQuestionDto) {
        return await this.geminiService.askQuizQuestion(courseId, askQuizQuestionDto.question);
    }
    async getPersonalReport(courseId, getPersonalReportDto) {
        return await this.geminiService.getPersonalReport(courseId, getPersonalReportDto.studentId);
    }
};
exports.GeminiController = GeminiController;
__decorate([
    (0, common_1.Get)(':courseId/get-weekly-study-plan'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate weekly study plan for a course',
        description: 'Gets course information and generates a comprehensive weekly study plan using AI'
    }),
    (0, swagger_1.ApiParam)({
        name: 'courseId',
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Study plan generated successfully',
        type: gemini_dto_1.WeeklyStudyPlanResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Course not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - failed to generate study plan'
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getWeeklyStudyPlan", null);
__decorate([
    (0, common_1.Post)(':courseId/get-quiz'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate quiz for a course',
        description: 'Creates a comprehensive quiz based on course content and study plan for specified weeks'
    }),
    (0, swagger_1.ApiParam)({
        name: 'courseId',
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz generated successfully',
        type: gemini_dto_1.QuizResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Course not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - study plan not found or failed to generate quiz'
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gemini_dto_1.GetQuizDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getQuiz", null);
__decorate([
    (0, common_1.Post)(':courseId/get-assignment'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate assignment for a course',
        description: 'Creates a comprehensive assignment based on course content and study plan for specified weeks'
    }),
    (0, swagger_1.ApiParam)({
        name: 'courseId',
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Assignment generated successfully',
        type: gemini_dto_1.AssignmentResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Course not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - study plan not found or failed to generate assignment'
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gemini_dto_1.GetAssignmentDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getAssignment", null);
__decorate([
    (0, common_1.Post)(':courseId/ask-quiz-question'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ask question about quiz logic and answers',
        description: 'Gets detailed explanation about quiz questions, logic, and correct answers'
    }),
    (0, swagger_1.ApiParam)({
        name: 'courseId',
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Question answered successfully',
        type: gemini_dto_1.QuizQuestionResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Course not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - failed to answer question'
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gemini_dto_1.AskQuizQuestionDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "askQuizQuestion", null);
__decorate([
    (0, common_1.Post)(':courseId/get-personal-report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate personal report for student',
        description: 'Analyzes student quiz performance and generates detailed report on knowledge gaps and recommendations'
    }),
    (0, swagger_1.ApiParam)({
        name: 'courseId',
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Personal report generated successfully',
        type: gemini_dto_1.PersonalReportResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Course not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - no quiz attempts found or failed to generate report'
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gemini_dto_1.GetPersonalReportDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getPersonalReport", null);
exports.GeminiController = GeminiController = __decorate([
    (0, swagger_1.ApiTags)('Gemini AI'),
    (0, common_1.Controller)('gemini'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], GeminiController);
//# sourceMappingURL=gemini.controller.js.map