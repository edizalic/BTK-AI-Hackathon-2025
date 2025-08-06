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
exports.CreateQuizDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class QuizQuestionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question ID',
        example: 'q1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question text',
        example: 'What does SQL stand for?',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Answer options',
        example: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QuizQuestionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Index of the correct answer (0-based)',
        example: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QuizQuestionDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points for this question',
        example: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QuizQuestionDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Explanation for the correct answer',
        example: 'SQL stands for Structured Query Language, which is used to communicate with databases.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "explanation", void 0);
class CreateQuizDto {
}
exports.CreateQuizDto = CreateQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: 'clr4x1234567890123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz title',
        example: 'Database Fundamentals Quiz',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz description',
        example: 'Test your understanding of database concepts and SQL',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz duration',
        example: '60 minutes',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Due date for the quiz',
        example: '2024-02-15T23:59:59.000Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is the quiz timed',
        example: true,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "isTimed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of attempts allowed',
        example: 2,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "attemptsAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz questions with correct answers',
        type: [QuizQuestionDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuizQuestionDto),
    __metadata("design:type", Array)
], CreateQuizDto.prototype, "questions", void 0);
//# sourceMappingURL=create-quiz.dto.js.map