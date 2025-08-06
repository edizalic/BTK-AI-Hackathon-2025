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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let CoursesService = CoursesService_1 = class CoursesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CoursesService_1.name);
    }
    async createCourse(dto, supervisorId) {
        try {
            const supervisor = await this.prisma.user.findUnique({
                where: { id: supervisorId },
                include: { profile: true },
            });
            if (!supervisor) {
                throw new common_1.NotFoundException('Supervisor not found');
            }
            if (supervisor.role !== client_1.UserRole.SUPERVISOR_TEACHER) {
                throw new common_1.BadRequestException('Only supervisor teachers can create courses');
            }
            const instructor = await this.prisma.user.findUnique({
                where: { id: dto.instructorId },
                include: { profile: true },
            });
            if (!instructor) {
                throw new common_1.NotFoundException('Instructor not found');
            }
            if (instructor.role !== client_1.UserRole.TEACHER && instructor.role !== client_1.UserRole.SUPERVISOR_TEACHER) {
                throw new common_1.BadRequestException('Instructor must be a teacher or supervisor teacher');
            }
            let department = await this.prisma.department.findUnique({
                where: { id: dto.departmentId },
            });
            if (!department) {
                department = await this.prisma.department.findUnique({
                    where: { name: dto.departmentId },
                });
            }
            if (!department) {
                throw new common_1.NotFoundException(`Department not found with ID or name: ${dto.departmentId}`);
            }
            const existingCourse = await this.prisma.course.findUnique({
                where: { code: dto.code },
            });
            if (existingCourse) {
                throw new common_1.BadRequestException('Course code already exists');
            }
            const course = await this.prisma.course.create({
                data: {
                    code: dto.code,
                    name: dto.name,
                    description: dto.description,
                    credits: dto.credits,
                    scheduleDays: dto.scheduleDays,
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    location: dto.location,
                    building: dto.building,
                    room: dto.room,
                    createdById: supervisorId,
                    instructorId: dto.instructorId,
                    semester: dto.semester,
                    year: dto.year,
                    capacity: dto.capacity,
                    category: dto.category,
                    departmentId: department.id,
                    level: dto.level,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                    enrollmentDeadline: dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : null,
                    studyPlan: dto.studyPlan ? JSON.parse(JSON.stringify(dto.studyPlan)) : null,
                },
                include: {
                    instructor: {
                        include: { profile: true },
                    },
                    department: true,
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
            this.logger.log(`Course created: ${course.code} - ${course.name} by supervisor ${supervisor.email}`);
            return course;
        }
        catch (error) {
            this.logger.error('Error creating course:', error);
            throw error;
        }
    }
    async findAll(filters = {}) {
        return this.prisma.course.findMany({
            include: {
                instructor: {
                    include: { profile: true },
                },
                department: true,
                enrollments: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findById(id) {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                instructor: {
                    include: { profile: true },
                },
                department: true,
                enrollments: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
                assignments: true,
                courseMaterials: true,
                quizzes: true,
                announcements: true,
            },
        });
    }
    async getCoursesByInstructor(teacherId) {
        return this.prisma.course.findMany({
            where: { instructorId: teacherId },
            include: {
                department: true,
                enrollments: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async getCoursesByStudent(studentId) {
        return this.prisma.course.findMany({
            where: {
                enrollments: {
                    some: {
                        studentId,
                        status: 'ACTIVE',
                    },
                },
            },
            include: {
                instructor: {
                    include: { profile: true },
                },
                department: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async createStudyPlan(courseId, dto, userId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            if (course.instructorId !== userId && course.createdById !== userId) {
                throw new common_1.BadRequestException('You do not have permission to create study plan for this course');
            }
            const updatedCourse = await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    studyPlan: JSON.parse(JSON.stringify(dto.weeks)),
                },
                include: {
                    instructor: {
                        include: { profile: true },
                    },
                    department: true,
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
            this.logger.log(`Study plan created for course: ${course.code} by user ${userId}`);
            return updatedCourse;
        }
        catch (error) {
            this.logger.error('Error creating study plan:', error);
            throw error;
        }
    }
    async getStudyPlan(courseId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    studyPlan: true,
                },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            return {
                courseId: course.id,
                courseCode: course.code,
                courseName: course.name,
                studyPlan: course.studyPlan || [],
            };
        }
        catch (error) {
            this.logger.error('Error getting study plan:', error);
            throw error;
        }
    }
    async updateStudyPlan(courseId, dto, userId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            if (course.instructorId !== userId && course.createdById !== userId) {
                throw new common_1.BadRequestException('You do not have permission to update study plan for this course');
            }
            const updatedCourse = await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    studyPlan: JSON.parse(JSON.stringify(dto.weeks)),
                },
                include: {
                    instructor: {
                        include: { profile: true },
                    },
                    department: true,
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
            this.logger.log(`Study plan updated for course: ${course.code} by user ${userId}`);
            return updatedCourse;
        }
        catch (error) {
            this.logger.error('Error updating study plan:', error);
            throw error;
        }
    }
    async deleteStudyPlan(courseId, userId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            if (course.instructorId !== userId && course.createdById !== userId) {
                throw new common_1.BadRequestException('You do not have permission to delete study plan for this course');
            }
            const updatedCourse = await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    studyPlan: null,
                },
                include: {
                    instructor: {
                        include: { profile: true },
                    },
                    department: true,
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
            this.logger.log(`Study plan deleted for course: ${course.code} by user ${userId}`);
            return updatedCourse;
        }
        catch (error) {
            this.logger.error('Error deleting study plan:', error);
            throw error;
        }
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map