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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async createStudent(dto, supervisorId) {
        try {
            const existingUser = await this.findByEmail(dto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already exists');
            }
            const hashedPassword = await this.hashPassword(dto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hashedPassword,
                    role: client_1.UserRole.STUDENT,
                    studentRegisteredById: supervisorId,
                    profile: {
                        create: {
                            firstName: dto.firstName,
                            lastName: dto.lastName,
                            grade: dto.grade,
                            major: dto.major,
                            minor: dto.minor,
                            enrollmentDate: dto.enrollmentDate || new Date(),
                            studentId: dto.studentId,
                            advisoryTeacherId: dto.advisoryTeacherId,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: supervisorId,
                    action: 'register_student',
                    details: { studentId: user.id, email: dto.email },
                },
            });
            return user;
        }
        catch (error) {
            this.logger.error('Error creating student:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create student');
        }
    }
    async createTeacher(dto, supervisorId) {
        try {
            const existingUser = await this.findByEmail(dto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already exists');
            }
            const hashedPassword = await this.hashPassword(dto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hashedPassword,
                    role: client_1.UserRole.TEACHER,
                    teacherRegisteredById: supervisorId,
                    profile: {
                        create: {
                            firstName: dto.firstName,
                            lastName: dto.lastName,
                            department: dto.department,
                            position: dto.position,
                            specialization: dto.specialization,
                            hireDate: dto.hireDate || new Date(),
                            employeeId: dto.employeeId,
                            officeLocation: dto.officeLocation,
                            officeHours: dto.officeHours,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: supervisorId,
                    action: 'register_teacher',
                    details: { teacherId: user.id, email: dto.email },
                },
            });
            return user;
        }
        catch (error) {
            this.logger.error('Error creating teacher:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create teacher');
        }
    }
    async createSupervisor(dto, adminId) {
        try {
            const existingUser = await this.findByEmail(dto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already exists');
            }
            const hashedPassword = await this.hashPassword(dto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hashedPassword,
                    role: client_1.UserRole.SUPERVISOR_TEACHER,
                    isSupervisor: true,
                    teacherRegisteredById: adminId,
                    profile: {
                        create: {
                            firstName: dto.firstName,
                            lastName: dto.lastName,
                            department: dto.department,
                            position: dto.position,
                            hireDate: dto.hireDate || new Date(),
                            employeeId: dto.employeeId,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: adminId,
                    action: 'register_supervisor',
                    details: { supervisorId: user.id, email: dto.email },
                },
            });
            return user;
        }
        catch (error) {
            this.logger.error('Error creating supervisor:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create supervisor');
        }
    }
    async findAll(filters = {}) {
        const where = {};
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.department) {
            where.profile = {
                department: {
                    contains: filters.department,
                    mode: 'insensitive',
                },
            };
        }
        if (filters.search) {
            where.OR = [
                {
                    email: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    profile: {
                        OR: [
                            {
                                firstName: {
                                    contains: filters.search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                lastName: {
                                    contains: filters.search,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                },
            ];
        }
        return this.prisma.user.findMany({
            where,
            include: {
                profile: true,
            },
            orderBy: [
                { role: 'asc' },
                { profile: { firstName: 'asc' } },
            ],
            take: filters.limit || 50,
            skip: filters.offset || 0,
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
    }
    async findByRole(role) {
        return this.prisma.user.findMany({
            where: { role, isActive: true },
            include: {
                profile: true,
            },
            orderBy: {
                profile: { firstName: 'asc' },
            },
        });
    }
    async updateUser(id, dto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        try {
            return await this.prisma.user.update({
                where: { id },
                data: {
                    email: dto.email,
                    avatar: dto.avatar,
                    isActive: dto.isActive,
                },
                include: {
                    profile: true,
                },
            });
        }
        catch (error) {
            this.logger.error(`Error updating user ${id}:`, error);
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async deactivateUser(id, deactivatedBy) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        try {
            await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: deactivatedBy,
                    action: 'deactivate_user',
                    details: { deactivatedUserId: id, email: user.email },
                },
            });
        }
        catch (error) {
            this.logger.error(`Error deactivating user ${id}:`, error);
            throw new common_1.BadRequestException('Failed to deactivate user');
        }
    }
    async assignAdvisoryTeacher(dto, supervisorId) {
        const student = await this.findById(dto.studentId);
        if (!student || student.role !== client_1.UserRole.STUDENT) {
            throw new common_1.NotFoundException('Student not found');
        }
        const teacher = await this.findById(dto.advisoryTeacherId);
        if (!teacher || (teacher.role !== client_1.UserRole.TEACHER && teacher.role !== client_1.UserRole.SUPERVISOR_TEACHER)) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        try {
            await this.prisma.advisoryAssignment.upsert({
                where: { studentId: dto.studentId },
                update: {
                    advisoryTeacherId: dto.advisoryTeacherId,
                    assignedById: supervisorId,
                    assignedDate: new Date(),
                    isActive: true,
                    notes: dto.notes,
                },
                create: {
                    studentId: dto.studentId,
                    advisoryTeacherId: dto.advisoryTeacherId,
                    assignedById: supervisorId,
                    notes: dto.notes,
                },
            });
            await this.prisma.userProfile.update({
                where: { userId: dto.studentId },
                data: {
                    advisoryTeacherId: dto.advisoryTeacherId,
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: supervisorId,
                    action: 'assign_advisory_teacher',
                    details: {
                        studentId: dto.studentId,
                        advisoryTeacherId: dto.advisoryTeacherId,
                    },
                },
            });
        }
        catch (error) {
            this.logger.error('Error assigning advisory teacher:', error);
            throw new common_1.BadRequestException('Failed to assign advisory teacher');
        }
    }
    async getTeachers() {
        return this.findByRole(client_1.UserRole.TEACHER);
    }
    async getSupervisors() {
        return this.prisma.user.findMany({
            where: {
                role: client_1.UserRole.SUPERVISOR_TEACHER,
                isActive: true,
            },
            include: {
                profile: true,
            },
            orderBy: {
                profile: { firstName: 'asc' },
            },
        });
    }
    async getStudents() {
        return this.findByRole(client_1.UserRole.STUDENT);
    }
    async getUserStats() {
        const [total, students, teachers, supervisors, admins, active, inactive,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: client_1.UserRole.STUDENT } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.TEACHER } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.SUPERVISOR_TEACHER } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.ADMIN } }),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isActive: false } }),
        ]);
        return {
            total,
            students,
            teachers,
            supervisors,
            admins,
            active,
            inactive,
        };
    }
    async resetUserPassword(userId, newPassword, supervisorId) {
        try {
            const targetUser = await this.findById(userId);
            if (!targetUser) {
                throw new common_1.NotFoundException('User not found');
            }
            const canReset = await this.canSupervisorResetPassword(supervisorId, targetUser);
            if (!canReset) {
                throw new common_1.ForbiddenException('You do not have permission to reset this user\'s password');
            }
            const hashedPassword = await this.hashPassword(newPassword);
            await this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash: hashedPassword },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: supervisorId,
                    action: 'reset_user_password',
                    details: {
                        targetUserId: userId,
                        targetUserEmail: targetUser.email,
                        targetUserRole: targetUser.role
                    },
                },
            });
            this.logger.log(`Password reset for user ${targetUser.email} by supervisor ${supervisorId}`);
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Error resetting user password:', error);
            throw new common_1.BadRequestException('Failed to reset password');
        }
    }
    async canSupervisorResetPassword(supervisorId, targetUser) {
        const supervisor = await this.findById(supervisorId);
        if (!supervisor || supervisor.role !== client_1.UserRole.SUPERVISOR_TEACHER) {
            return false;
        }
        if (targetUser.role === client_1.UserRole.STUDENT) {
            if (targetUser.studentRegisteredById === supervisorId) {
                return true;
            }
            if (supervisor.profile?.department === targetUser.profile?.department) {
                return true;
            }
        }
        if (targetUser.role === client_1.UserRole.TEACHER) {
            if (targetUser.teacherRegisteredById === supervisorId) {
                return true;
            }
            if (supervisor.profile?.department === targetUser.profile?.department) {
                return true;
            }
        }
        return false;
    }
    async hashPassword(password) {
        const saltRounds = this.configService.get('security.bcryptRounds');
        return bcrypt.hash(password, saltRounds);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map