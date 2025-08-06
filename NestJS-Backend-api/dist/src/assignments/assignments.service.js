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
var AssignmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let AssignmentsService = AssignmentsService_1 = class AssignmentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AssignmentsService_1.name);
    }
    async createAssignment(dto, creatorId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: dto.courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            const creator = await this.prisma.user.findUnique({
                where: { id: creatorId },
            });
            if (!creator) {
                throw new common_1.NotFoundException('Creator not found');
            }
            const canCreate = creator.role === client_1.UserRole.SUPERVISOR_TEACHER ||
                course.instructorId === creatorId ||
                course.createdById === creatorId;
            if (!canCreate) {
                throw new common_1.ForbiddenException('You cannot create assignments for this course');
            }
            return await this.prisma.assignment.create({
                data: {
                    courseId: dto.courseId,
                    createdById: creatorId,
                    title: dto.title,
                    description: dto.description,
                    type: dto.type,
                    dueDate: dto.dueDate,
                    maxPoints: dto.maxPoints,
                    isGroupWork: dto.isGroupWork || false,
                },
                include: {
                    course: true,
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error('Error creating assignment:', error);
            throw error;
        }
    }
    async findAll(filters = {}) {
        const where = {};
        if (filters.courseId) {
            where.courseId = filters.courseId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        return this.prisma.assignment.findMany({
            where,
            include: {
                course: {
                    include: { department: true },
                },
                createdBy: {
                    include: { profile: true },
                },
                submissions: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async findById(id) {
        return this.prisma.assignment.findUnique({
            where: { id },
            include: {
                course: {
                    include: {
                        department: true,
                        instructor: {
                            include: { profile: true },
                        },
                    },
                },
                createdBy: {
                    include: { profile: true },
                },
                submissions: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                        files: true,
                        grade: true,
                    },
                },
                attachments: true,
            },
        });
    }
    async updateAssignment(id, dto, userId) {
        const assignment = await this.findById(id);
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canUpdate = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            assignment.createdById === userId;
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You cannot update this assignment');
        }
        return this.prisma.assignment.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                type: dto.type,
                dueDate: dto.dueDate,
                maxPoints: dto.maxPoints,
                isGroupWork: dto.isGroupWork,
                status: dto.status,
            },
            include: {
                course: true,
                createdBy: {
                    include: { profile: true },
                },
            },
        });
    }
    async getAssignmentsByStudent(studentId) {
        return this.prisma.assignment.findMany({
            where: {
                course: {
                    enrollments: {
                        some: {
                            studentId,
                            status: 'ACTIVE',
                        },
                    },
                },
            },
            include: {
                course: {
                    include: {
                        instructor: {
                            include: { profile: true },
                        },
                    },
                },
                submissions: {
                    where: { studentId },
                    include: { grade: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getAssignmentsByCourse(courseId) {
        return this.prisma.assignment.findMany({
            where: { courseId },
            include: {
                createdBy: {
                    include: { profile: true },
                },
                submissions: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                        grade: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteAssignment(id, userId) {
        const assignment = await this.findById(id);
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canDelete = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            assignment.createdById === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You cannot delete this assignment');
        }
        await this.prisma.assignment.delete({
            where: { id },
        });
    }
    async checkOverdueAssignments() {
        try {
            const now = new Date();
            await this.prisma.assignment.updateMany({
                where: {
                    dueDate: { lt: now },
                    status: { in: ['ASSIGNED', 'DRAFT'] },
                },
                data: {
                    status: client_1.AssignmentStatus.OVERDUE,
                },
            });
            this.logger.log('Updated overdue assignments');
        }
        catch (error) {
            this.logger.error('Error checking overdue assignments:', error);
        }
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = AssignmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map