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
var GradesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const grade_calculation_service_1 = require("./grade-calculation.service");
let GradesService = GradesService_1 = class GradesService {
    constructor(prisma, gradeCalculationService) {
        this.prisma = prisma;
        this.gradeCalculationService = gradeCalculationService;
        this.logger = new common_1.Logger(GradesService_1.name);
    }
    async gradeAssignment(submissionId, gradeDto, graderId) {
        try {
            const submission = await this.prisma.assignmentSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    assignment: {
                        include: {
                            course: true,
                        },
                    },
                    student: true,
                    grade: true,
                },
            });
            if (!submission) {
                throw new common_1.NotFoundException('Submission not found');
            }
            if (submission.grade) {
                throw new common_1.ForbiddenException('This submission has already been graded');
            }
            const grader = await this.prisma.user.findUnique({
                where: { id: graderId },
            });
            if (!grader) {
                throw new common_1.NotFoundException('Grader not found');
            }
            const canGrade = grader.role === client_1.UserRole.SUPERVISOR_TEACHER ||
                submission.assignment.course.instructorId === graderId;
            if (!canGrade) {
                throw new common_1.ForbiddenException('You cannot grade this assignment');
            }
            const percentage = (gradeDto.score / gradeDto.maxPoints) * 100;
            const grade = await this.prisma.grade.create({
                data: {
                    studentId: submission.studentId,
                    courseId: submission.assignment.courseId,
                    assignmentId: submission.assignment.id,
                    submissionId: submissionId,
                    letterGrade: gradeDto.letterGrade,
                    score: gradeDto.score,
                    maxPoints: gradeDto.maxPoints,
                    percentage,
                    gradedById: graderId,
                    feedback: gradeDto.feedback,
                    isExtraCredit: gradeDto.isExtraCredit || false,
                    weight: gradeDto.weight,
                },
                include: {
                    student: {
                        include: { profile: true },
                    },
                    assignment: {
                        include: { course: true },
                    },
                    gradedBy: {
                        include: { profile: true },
                    },
                },
            });
            await this.prisma.assignment.update({
                where: { id: submission.assignment.id },
                data: { status: client_1.AssignmentStatus.GRADED },
            });
            await this.gradeCalculationService.updateStudentGPA(submission.studentId);
            await this.prisma.userActivity.create({
                data: {
                    userId: graderId,
                    action: 'grade_assignment',
                    details: {
                        gradeId: grade.id,
                        studentId: submission.studentId,
                        assignmentId: submission.assignment.id,
                        score: gradeDto.score,
                        maxPoints: gradeDto.maxPoints,
                    },
                },
            });
            return grade;
        }
        catch (error) {
            this.logger.error('Error grading assignment:', error);
            throw error;
        }
    }
    async updateGrade(gradeId, dto, graderId) {
        const grade = await this.prisma.grade.findUnique({
            where: { id: gradeId },
            include: {
                assignment: {
                    include: { course: true },
                },
                student: true,
            },
        });
        if (!grade) {
            throw new common_1.NotFoundException('Grade not found');
        }
        const grader = await this.prisma.user.findUnique({
            where: { id: graderId },
        });
        const canUpdate = grader?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            grade.gradedById === graderId ||
            (grade.assignment?.course.instructorId === graderId);
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You cannot update this grade');
        }
        let percentage = grade.percentage;
        if (dto.score !== undefined || dto.maxPoints !== undefined) {
            const newScore = dto.score ?? grade.score;
            const newMaxPoints = dto.maxPoints ?? grade.maxPoints;
            percentage = (newScore / newMaxPoints) * 100;
        }
        const updatedGrade = await this.prisma.grade.update({
            where: { id: gradeId },
            data: {
                letterGrade: dto.letterGrade,
                score: dto.score,
                maxPoints: dto.maxPoints,
                percentage,
                feedback: dto.feedback,
                isExtraCredit: dto.isExtraCredit,
                weight: dto.weight,
            },
            include: {
                student: {
                    include: { profile: true },
                },
                assignment: {
                    include: { course: true },
                },
                gradedBy: {
                    include: { profile: true },
                },
            },
        });
        await this.gradeCalculationService.updateStudentGPA(grade.studentId);
        return updatedGrade;
    }
    async getGradesByStudent(studentId, filters = {}) {
        const where = { studentId };
        if (filters.courseId) {
            where.courseId = filters.courseId;
        }
        if (filters.semester) {
        }
        if (filters.year) {
        }
        const grades = await this.prisma.grade.findMany({
            where,
            include: {
                course: {
                    include: { department: true },
                },
                assignment: true,
                gradedBy: {
                    include: { profile: true },
                },
            },
            orderBy: {
                gradedDate: 'desc',
            },
        });
        return grades.map(grade => ({
            ...grade,
            gradeType: grade.assignmentId ? 'assignment' : 'quiz',
            title: grade.assignment?.title || grade.feedback?.replace('Quiz: ', '') || 'Unknown',
        }));
    }
    async getGradesByCourse(courseId) {
        return this.prisma.grade.findMany({
            where: { courseId },
            include: {
                student: {
                    include: { profile: true },
                },
                assignment: true,
                gradedBy: {
                    include: { profile: true },
                },
            },
            orderBy: [
                { student: { profile: { lastName: 'asc' } } },
                { gradedDate: 'desc' },
            ],
        });
    }
    async generateGradeReport(studentId, semester, year) {
        const filters = { studentId };
        const grades = await this.getGradesByStudent(studentId, filters);
        const gpa = await this.gradeCalculationService.calculateGPA(studentId, semester, year);
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            include: { profile: true },
        });
        return {
            student: {
                id: student?.id,
                name: `${student?.profile?.firstName} ${student?.profile?.lastName}`,
                studentId: student?.profile?.studentId,
            },
            period: {
                semester,
                year,
            },
            grades: grades.map(grade => ({
                course: grade.course?.name,
                assignment: grade.assignment?.title,
                score: grade.score,
                maxPoints: grade.maxPoints,
                percentage: grade.percentage,
                letterGrade: grade.letterGrade,
                gradedDate: grade.gradedDate,
            })),
            gpa,
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = GradesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        grade_calculation_service_1.GradeCalculationService])
], GradesService);
//# sourceMappingURL=grades.service.js.map