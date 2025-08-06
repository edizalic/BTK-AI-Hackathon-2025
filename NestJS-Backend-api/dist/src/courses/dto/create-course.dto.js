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
exports.CreateCourseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const study_plan_dto_1 = require("./study-plan.dto");
class CreateCourseDto {
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique course code',
        example: 'CS204'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course name',
        example: 'Computer Science Fundamentals'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course description',
        example: 'Introduction to computer science concepts'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of credits',
        example: 3,
        minimum: 1,
        maximum: 6
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "credits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days of the week when course meets',
        example: ['monday', 'wednesday', 'friday'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "scheduleDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time in HH:MM format',
        example: '09:00'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time in HH:MM format',
        example: '10:30'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location/room identifier',
        example: 'Room 101'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Building name',
        example: 'Science Building',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "building", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Room number',
        example: '202',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the instructor (teacher) assigned to this course',
        example: 'cmdz6y2b80006vvy4gvza1dt3'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Semester',
        example: 'Spring'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year',
        example: 2025
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2030),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of students that can enroll',
        example: 30,
        minimum: 1
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course category',
        example: 'Core'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department ID',
        example: 'dept_computer_science'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course difficulty level',
        enum: client_1.CourseLevel,
        example: client_1.CourseLevel.BEGINNER
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        const levelMap = {
            'UNDERGRADUATE': client_1.CourseLevel.BEGINNER,
            'GRADUATE': client_1.CourseLevel.INTERMEDIATE,
            'DOCTORAL': client_1.CourseLevel.ADVANCED,
            'BEGINNER': client_1.CourseLevel.BEGINNER,
            'INTERMEDIATE': client_1.CourseLevel.INTERMEDIATE,
            'ADVANCED': client_1.CourseLevel.ADVANCED
        };
        return levelMap[value?.toString().toUpperCase()] || value;
    }),
    (0, class_validator_1.IsEnum)(client_1.CourseLevel),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course start date',
        example: '2025-09-25'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course end date',
        example: '2025-12-05'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enrollment deadline',
        example: '2025-09-20',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "enrollmentDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Study plan for the course',
        example: [
            {
                "week": "1",
                "description": "Introduction to Course Concepts",
                "topics": ["Variables", "Data Types"],
                "assignments": ["Assignment 1"],
                "readings": ["Chapter 1-2"]
            }
        ],
        required: false,
        type: [study_plan_dto_1.StudyPlanWeekDto]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => study_plan_dto_1.StudyPlanWeekDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "studyPlan", void 0);
//# sourceMappingURL=create-course.dto.js.map