import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { UserRole, User, UserProfile } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFiltersDto } from './dto/user-filters.dto';
import { AssignAdvisoryDto } from './dto/assign-advisory.dto';
import { UserWithProfile } from './interfaces/user-with-profile.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createStudent(dto: CreateStudentDto, supervisorId: string): Promise<UserWithProfile> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: UserRole.STUDENT,
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

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: supervisorId,
          action: 'register_student',
          details: { studentId: user.id, email: dto.email },
        },
      });

      return user as UserWithProfile;
    } catch (error) {
      this.logger.error('Error creating student:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create student');
    }
  }

  async createTeacher(dto: CreateTeacherDto, supervisorId: string): Promise<UserWithProfile> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: UserRole.TEACHER,
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

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: supervisorId,
          action: 'register_teacher',
          details: { teacherId: user.id, email: dto.email },
        },
      });

      return user as UserWithProfile;
    } catch (error) {
      this.logger.error('Error creating teacher:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create teacher');
    }
  }

  async createSupervisor(dto: CreateSupervisorDto, adminId: string): Promise<UserWithProfile> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: UserRole.SUPERVISOR_TEACHER,
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

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: adminId,
          action: 'register_supervisor',
          details: { supervisorId: user.id, email: dto.email },
        },
      });

      return user as UserWithProfile;
    } catch (error) {
      this.logger.error('Error creating supervisor:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create supervisor');
    }
  }

  async findAll(filters: UserFiltersDto = {}): Promise<UserWithProfile[]> {
    const where: any = {};

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

  async findById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
  }

  async findByRole(role: UserRole): Promise<UserWithProfile[]> {
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

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserWithProfile> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
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
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async deactivateUser(id: string, deactivatedBy: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: deactivatedBy,
          action: 'deactivate_user',
          details: { deactivatedUserId: id, email: user.email },
        },
      });
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}:`, error);
      throw new BadRequestException('Failed to deactivate user');
    }
  }

  async assignAdvisoryTeacher(
    dto: AssignAdvisoryDto,
    supervisorId: string,
  ): Promise<void> {
    const student = await this.findById(dto.studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    const teacher = await this.findById(dto.advisoryTeacherId);
    if (!teacher || (teacher.role !== UserRole.TEACHER && teacher.role !== UserRole.SUPERVISOR_TEACHER)) {
      throw new NotFoundException('Teacher not found');
    }

    try {
      // Create or update advisory assignment
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

      // Update student profile
      await this.prisma.userProfile.update({
        where: { userId: dto.studentId },
        data: {
          advisoryTeacherId: dto.advisoryTeacherId,
        },
      });

      // Log activity
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
    } catch (error) {
      this.logger.error('Error assigning advisory teacher:', error);
      throw new BadRequestException('Failed to assign advisory teacher');
    }
  }

  async getTeachers(): Promise<UserWithProfile[]> {
    return this.findByRole(UserRole.TEACHER);
  }

  async getSupervisors(): Promise<UserWithProfile[]> {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.SUPERVISOR_TEACHER,
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

  async getStudents(): Promise<UserWithProfile[]> {
    return this.findByRole(UserRole.STUDENT);
  }

  async getUserStats(): Promise<{
    total: number;
    students: number;
    teachers: number;
    supervisors: number;
    admins: number;
    active: number;
    inactive: number;
  }> {
    const [
      total,
      students,
      teachers,
      supervisors,
      admins,
      active,
      inactive,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.TEACHER } }),
      this.prisma.user.count({ where: { role: UserRole.SUPERVISOR_TEACHER } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
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

  async resetUserPassword(
    userId: string, 
    newPassword: string, 
    supervisorId: string
  ): Promise<{ message: string }> {
    try {
      // Get the user to be reset
      const targetUser = await this.findById(userId);
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      // Check if supervisor can reset this user's password
      const canReset = await this.canSupervisorResetPassword(supervisorId, targetUser);
      if (!canReset) {
        throw new ForbiddenException('You do not have permission to reset this user\'s password');
      }

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update the user's password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      // Log the activity
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error resetting user password:', error);
      throw new BadRequestException('Failed to reset password');
    }
  }

  private async canSupervisorResetPassword(supervisorId: string, targetUser: UserWithProfile): Promise<boolean> {
    // Get supervisor details
    const supervisor = await this.findById(supervisorId);
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR_TEACHER) {
      return false;
    }

    // Supervisors can reset passwords for:
    // 1. Students they registered
    // 2. Teachers they registered  
    // 3. Students/Teachers in their department
    
    if (targetUser.role === UserRole.STUDENT) {
      // Check if supervisor registered this student
      if (targetUser.studentRegisteredById === supervisorId) {
        return true;
      }
      
      // Check if they're in the same department
      if (supervisor.profile?.department === targetUser.profile?.department) {
        return true;
      }
    }

    if (targetUser.role === UserRole.TEACHER) {
      // Check if supervisor registered this teacher
      if (targetUser.teacherRegisteredById === supervisorId) {
        return true;
      }
      
      // Check if they're in the same department
      if (supervisor.profile?.department === targetUser.profile?.department) {
        return true;
      }
    }

    // Cannot reset passwords for other supervisors or admins
    return false;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('security.bcryptRounds');
    return bcrypt.hash(password, saltRounds);
  }
}