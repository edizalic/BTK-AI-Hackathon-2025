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
var EnrollmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let EnrollmentService = EnrollmentService_1 = class EnrollmentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EnrollmentService_1.name);
    }
    async enrollStudent(courseId, studentId, supervisorId) {
        return this.prisma.enrollment.create({
            data: {
                courseId,
                studentId,
                enrolledById: supervisorId,
            },
        });
    }
    async getEnrollmentsByCourse(courseId) {
        return this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: {
                    include: { profile: true },
                },
            },
        });
    }
    async getEnrollmentsByStudent(studentId) {
        return this.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        instructor: {
                            include: { profile: true },
                        },
                        department: true,
                    },
                },
            },
        });
    }
    async bulkEnrollStudents(courseId, studentIds, supervisorId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
            });
            if (!course) {
                throw new common_1.BadRequestException('Course not found');
            }
            const existingEnrollments = await this.prisma.enrollment.findMany({
                where: {
                    courseId,
                    studentId: { in: studentIds },
                },
                select: { studentId: true },
            });
            const existingStudentIds = existingEnrollments.map(e => e.studentId);
            const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));
            if (newStudentIds.length === 0) {
                throw new common_1.BadRequestException('All students are already enrolled in this course');
            }
            const enrollments = await this.prisma.$transaction(newStudentIds.map(studentId => this.prisma.enrollment.create({
                data: {
                    courseId,
                    studentId,
                    enrolledById: supervisorId,
                },
                include: {
                    student: {
                        include: { profile: true },
                    },
                },
            })));
            this.logger.log(`Bulk enrolled ${enrollments.length} students in course ${courseId}`);
            return {
                success: true,
                enrolled: enrollments,
                skipped: existingStudentIds,
                message: `Successfully enrolled ${enrollments.length} students. ${existingStudentIds.length} students were already enrolled.`,
            };
        }
        catch (error) {
            this.logger.error('Error during bulk enrollment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to enroll students');
        }
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = EnrollmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map