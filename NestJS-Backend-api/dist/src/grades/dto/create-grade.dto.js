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
exports.CreateGradeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateGradeDto {
}
exports.CreateGradeDto = CreateGradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Letter grade',
        example: 'A',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGradeDto.prototype, "letterGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points scored',
        example: 85,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGradeDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum points possible',
        example: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGradeDto.prototype, "maxPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Feedback for the student',
        example: 'Good work! Consider reviewing chapter 5 for improvement.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGradeDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this extra credit',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGradeDto.prototype, "isExtraCredit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weight of this grade in course calculation',
        example: 1.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateGradeDto.prototype, "weight", void 0);
//# sourceMappingURL=create-grade.dto.js.map