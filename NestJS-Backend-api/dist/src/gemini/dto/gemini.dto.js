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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalReportResponseDto = exports.QuizQuestionResponseDto = exports.AssignmentResponseDto = exports.QuizResponseDto = exports.WeeklyStudyPlanResponseDto = exports.GetPersonalReportDto = exports.AskQuizQuestionDto = exports.GetAssignmentDto = exports.GetQuizDto = exports.GetWeeklyStudyPlanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GetWeeklyStudyPlanDto {
}
exports.GetWeeklyStudyPlanDto = GetWeeklyStudyPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetWeeklyStudyPlanDto.prototype, "courseId", void 0);
class GetQuizDto {
}
exports.GetQuizDto = GetQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuizDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weeks to cover in the quiz',
        example: [1, 2, 3],
        type: [Number]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(1, { each: true }),
    __metadata("design:type", Array)
], GetQuizDto.prototype, "weeksToCover", void 0);
class GetAssignmentDto {
}
exports.GetAssignmentDto = GetAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetAssignmentDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weeks to cover in the assignment',
        example: [1, 2, 3],
        type: [Number]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(1, { each: true }),
    __metadata("design:type", Array)
], GetAssignmentDto.prototype, "weeksToCover", void 0);
class AskQuizQuestionDto {
}
exports.AskQuizQuestionDto = AskQuizQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AskQuizQuestionDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question to ask about the quiz',
        example: 'What is the logic behind question 3?'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AskQuizQuestionDto.prototype, "question", void 0);
class GetPersonalReportDto {
}
exports.GetPersonalReportDto = GetPersonalReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'course_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetPersonalReportDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student ID',
        example: 'student_123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetPersonalReportDto.prototype, "studentId", void 0);
class WeeklyStudyPlanResponseDto {
}
exports.WeeklyStudyPlanResponseDto = WeeklyStudyPlanResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Generated weekly study plan',
        example: {
            weeks: [
                {
                    week: 1,
                    topics: ['Introduction to Course', 'Basic Concepts'],
                    activities: ['Reading Chapter 1', 'Assignment 1'],
                    objectives: ['Understand course structure', 'Learn basic terminology']
                }
            ]
        }
    }),
    __metadata("design:type", Object)
], WeeklyStudyPlanResponseDto.prototype, "studyPlan", void 0);
class QuizResponseDto {
}
exports.QuizResponseDto = QuizResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Generated quiz',
        example: {
            title: 'Week 1-3 Quiz',
            questions: [
                {
                    question: 'What is the main concept covered in week 1?',
                    options: ['A', 'B', 'C', 'D'],
                    correctAnswer: 'A'
                }
            ]
        }
    }),
    __metadata("design:type", Object)
], QuizResponseDto.prototype, "quiz", void 0);
class AssignmentResponseDto {
}
exports.AssignmentResponseDto = AssignmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Generated assignment',
        example: {
            title: 'Week 1-3 Assignment',
            description: 'Complete the following tasks...',
            requirements: ['Task 1', 'Task 2'],
            rubric: 'Grading criteria...'
        }
    }),
    __metadata("design:type", Object)
], AssignmentResponseDto.prototype, "assignment", void 0);
class QuizQuestionResponseDto {
}
exports.QuizQuestionResponseDto = QuizQuestionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Answer to the quiz question',
        example: 'The logic behind this question is...'
    }),
    __metadata("design:type", String)
], QuizQuestionResponseDto.prototype, "answer", void 0);
class PersonalReportResponseDto {
}
exports.PersonalReportResponseDto = PersonalReportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Personal report on student performance',
        example: {
            overallScore: 75,
            weakAreas: ['Topic A', 'Topic B'],
            recommendations: ['Review Chapter 3', 'Practice more exercises'],
            strengths: ['Good understanding of basic concepts']
        }
    }),
    __metadata("design:type", Object)
], PersonalReportResponseDto.prototype, "report", void 0);
//# sourceMappingURL=gemini.dto.js.map