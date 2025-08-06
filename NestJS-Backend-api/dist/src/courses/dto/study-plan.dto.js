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
exports.UpdateStudyPlanDto = exports.CreateStudyPlanDto = exports.StudyPlanWeekDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class StudyPlanWeekDto {
}
exports.StudyPlanWeekDto = StudyPlanWeekDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Week number or identifier',
        example: '1'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StudyPlanWeekDto.prototype, "week", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of what will be covered in this week',
        example: 'Introduction to Course Concepts and Basic Principles'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StudyPlanWeekDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Topics to be covered in this week',
        example: ['Variables and Data Types', 'Control Structures'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StudyPlanWeekDto.prototype, "topics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Assignments for this week',
        example: ['Assignment 1: Basic Programming'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StudyPlanWeekDto.prototype, "assignments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required readings for this week',
        example: ['Chapter 1-2 from Textbook'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StudyPlanWeekDto.prototype, "readings", void 0);
class CreateStudyPlanDto {
}
exports.CreateStudyPlanDto = CreateStudyPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of study plan weeks',
        type: [StudyPlanWeekDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StudyPlanWeekDto),
    __metadata("design:type", Array)
], CreateStudyPlanDto.prototype, "weeks", void 0);
class UpdateStudyPlanDto {
}
exports.UpdateStudyPlanDto = UpdateStudyPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of study plan weeks',
        type: [StudyPlanWeekDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StudyPlanWeekDto),
    __metadata("design:type", Array)
], UpdateStudyPlanDto.prototype, "weeks", void 0);
//# sourceMappingURL=study-plan.dto.js.map