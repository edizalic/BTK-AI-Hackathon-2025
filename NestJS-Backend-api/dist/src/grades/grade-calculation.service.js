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
var GradeCalculationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeCalculationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let GradeCalculationService = GradeCalculationService_1 = class GradeCalculationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GradeCalculationService_1.name);
    }
    async calculateGPA(studentId, semester, year) {
        try {
            const where = {
                studentId,
                isExtraCredit: false,
            };
            if (semester || year) {
                where.course = {
                    ...(semester && { semester }),
                    ...(year && { year }),
                };
            }
            const grades = await this.prisma.grade.findMany({
                where,
                include: {
                    course: true,
                },
            });
            if (grades.length === 0) {
                return 0;
            }
            let totalPoints = 0;
            let totalCredits = 0;
            for (const grade of grades) {
                const gradePoints = this.convertLetterGradeToPoints(grade.letterGrade);
                const credits = grade.course?.credits || 1;
                const weight = grade.weight || 1;
                totalPoints += gradePoints * credits * weight;
                totalCredits += credits * weight;
            }
            const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            return Math.round(gpa * 100) / 100;
        }
        catch (error) {
            this.logger.error(`Error calculating GPA for student ${studentId}:`, error);
            return 0;
        }
    }
    async updateStudentGPA(studentId) {
        try {
            const currentGPA = await this.calculateGPA(studentId);
            await this.prisma.userProfile.update({
                where: { userId: studentId },
                data: { gpa: currentGPA },
            });
            this.logger.log(`Updated GPA for student ${studentId}: ${currentGPA}`);
        }
        catch (error) {
            this.logger.error(`Error updating GPA for student ${studentId}:`, error);
        }
    }
    async calculateCourseGrades(courseId) {
        try {
            const grades = await this.prisma.grade.findMany({
                where: { courseId },
            });
            if (grades.length === 0) {
                return {
                    average: 0,
                    distribution: {},
                    totalStudents: 0,
                };
            }
            const totalPercentage = grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
            const average = totalPercentage / grades.length;
            const distribution = {};
            grades.forEach(grade => {
                const letter = grade.letterGrade;
                distribution[letter] = (distribution[letter] || 0) + 1;
            });
            return {
                average: Math.round(average * 100) / 100,
                distribution,
                totalStudents: grades.length,
            };
        }
        catch (error) {
            this.logger.error(`Error calculating course grades for ${courseId}:`, error);
            return {
                average: 0,
                distribution: {},
                totalStudents: 0,
            };
        }
    }
    convertLetterGradeToPoints(letterGrade) {
        const gradeScale = {
            'A+': 4.0,
            'A': 4.0,
            'A-': 3.7,
            'B+': 3.3,
            'B': 3.0,
            'B-': 2.7,
            'C+': 2.3,
            'C': 2.0,
            'C-': 1.7,
            'D+': 1.3,
            'D': 1.0,
            'D-': 0.7,
            'F': 0.0,
        };
        return gradeScale[letterGrade.toUpperCase()] || 0.0;
    }
    async getStudentTranscript(studentId) {
        try {
            const student = await this.prisma.user.findUnique({
                where: { id: studentId },
                include: { profile: true },
            });
            const enrollments = await this.prisma.enrollment.findMany({
                where: { studentId },
                include: {
                    course: {
                        include: {
                            department: true,
                            grades: {
                                where: { studentId },
                            },
                        },
                    },
                },
            });
            const courses = enrollments.map(enrollment => {
                const courseGrades = enrollment.course.grades;
                const averageGrade = courseGrades.length > 0
                    ? courseGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / courseGrades.length
                    : 0;
                return {
                    code: enrollment.course.code,
                    name: enrollment.course.name,
                    credits: enrollment.course.credits,
                    semester: enrollment.course.semester,
                    year: enrollment.course.year,
                    finalGrade: enrollment.finalGrade,
                    finalPoints: enrollment.finalPoints,
                    averageGrade: Math.round(averageGrade * 100) / 100,
                    status: enrollment.status,
                };
            });
            const overallGPA = await this.calculateGPA(studentId);
            const totalCredits = courses
                .filter(course => course.status === 'COMPLETED')
                .reduce((sum, course) => sum + course.credits, 0);
            return {
                student: {
                    id: student?.id,
                    name: `${student?.profile?.firstName} ${student?.profile?.lastName}`,
                    studentId: student?.profile?.studentId,
                    major: student?.profile?.major,
                    minor: student?.profile?.minor,
                },
                courses,
                overallGPA,
                totalCredits,
            };
        }
        catch (error) {
            this.logger.error(`Error generating transcript for student ${studentId}:`, error);
            throw error;
        }
    }
};
exports.GradeCalculationService = GradeCalculationService;
exports.GradeCalculationService = GradeCalculationService = GradeCalculationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradeCalculationService);
//# sourceMappingURL=grade-calculation.service.js.map