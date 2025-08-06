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
var SubmissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let SubmissionsService = SubmissionsService_1 = class SubmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SubmissionsService_1.name);
    }
    async submitAssignment(assignmentId, studentId, submissionDto) {
        try {
            const assignment = await this.prisma.assignment.findUnique({
                where: { id: assignmentId },
                include: {
                    course: {
                        include: {
                            enrollments: {
                                where: { studentId, status: 'ACTIVE' },
                            },
                        },
                    },
                },
            });
            if (!assignment) {
                throw new common_1.NotFoundException('Assignment not found');
            }
            if (assignment.course.enrollments.length === 0) {
                throw new common_1.BadRequestException('You are not enrolled in this course');
            }
            if (assignment.dueDate < new Date() && assignment.status !== client_1.AssignmentStatus.ASSIGNED) {
                throw new common_1.BadRequestException('Assignment submission deadline has passed');
            }
            const existingSubmission = await this.prisma.assignmentSubmission.findUnique({
                where: {
                    assignmentId_studentId: {
                        assignmentId,
                        studentId,
                    },
                },
            });
            if (existingSubmission) {
                throw new common_1.BadRequestException('You have already submitted this assignment');
            }
            const submission = await this.prisma.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId,
                    textContent: submissionDto.textContent,
                },
                include: {
                    assignment: {
                        include: {
                            course: true,
                        },
                    },
                    student: {
                        include: { profile: true },
                    },
                },
            });
            if (submissionDto.fileIds && submissionDto.fileIds.length > 0) {
                await this.prisma.fileAttachment.updateMany({
                    where: {
                        id: { in: submissionDto.fileIds },
                        uploadedById: studentId,
                    },
                    data: {},
                });
            }
            await this.prisma.assignment.update({
                where: { id: assignmentId },
                data: {
                    status: client_1.AssignmentStatus.SUBMITTED,
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: studentId,
                    action: 'submit_assignment',
                    details: {
                        assignmentId,
                        submissionId: submission.id,
                    },
                },
            });
            return submission;
        }
        catch (error) {
            this.logger.error('Error submitting assignment:', error);
            throw error;
        }
    }
    async getSubmission(assignmentId, studentId) {
        return this.prisma.assignmentSubmission.findUnique({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
            include: {
                assignment: {
                    include: {
                        course: true,
                    },
                },
                student: {
                    include: { profile: true },
                },
                files: true,
                grade: true,
            },
        });
    }
    async getAssignmentSubmissions(assignmentId) {
        return this.prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    include: { profile: true },
                },
                files: true,
                grade: true,
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }
    async getStudentSubmissions(studentId) {
        return this.prisma.assignmentSubmission.findMany({
            where: { studentId },
            include: {
                assignment: {
                    include: {
                        course: {
                            include: {
                                instructor: {
                                    include: { profile: true },
                                },
                            },
                        },
                    },
                },
                files: true,
                grade: true,
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }
    async updateSubmission(assignmentId, studentId, submissionDto) {
        const submission = await this.getSubmission(assignmentId, studentId);
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
        });
        if (assignment && assignment.dueDate < new Date()) {
            throw new common_1.BadRequestException('Cannot update submission after deadline');
        }
        return this.prisma.assignmentSubmission.update({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
            data: {
                textContent: submissionDto.textContent,
                submittedAt: new Date(),
            },
            include: {
                assignment: {
                    include: {
                        course: true,
                    },
                },
                student: {
                    include: { profile: true },
                },
                files: true,
                grade: true,
            },
        });
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = SubmissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map