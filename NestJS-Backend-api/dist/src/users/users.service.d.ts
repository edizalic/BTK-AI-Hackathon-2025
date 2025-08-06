import { UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFiltersDto } from './dto/user-filters.dto';
import { AssignAdvisoryDto } from './dto/assign-advisory.dto';
import { UserWithProfile } from './interfaces/user-with-profile.interface';
export declare class UsersService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    createStudent(dto: CreateStudentDto, supervisorId: string): Promise<UserWithProfile>;
    createTeacher(dto: CreateTeacherDto, supervisorId: string): Promise<UserWithProfile>;
    createSupervisor(dto: CreateSupervisorDto, adminId: string): Promise<UserWithProfile>;
    findAll(filters?: UserFiltersDto): Promise<UserWithProfile[]>;
    findById(id: string): Promise<UserWithProfile | null>;
    findByEmail(email: string): Promise<UserWithProfile | null>;
    findByRole(role: UserRole): Promise<UserWithProfile[]>;
    updateUser(id: string, dto: UpdateUserDto): Promise<UserWithProfile>;
    deactivateUser(id: string, deactivatedBy: string): Promise<void>;
    assignAdvisoryTeacher(dto: AssignAdvisoryDto, supervisorId: string): Promise<void>;
    getTeachers(): Promise<UserWithProfile[]>;
    getSupervisors(): Promise<UserWithProfile[]>;
    getStudents(): Promise<UserWithProfile[]>;
    getUserStats(): Promise<{
        total: number;
        students: number;
        teachers: number;
        supervisors: number;
        admins: number;
        active: number;
        inactive: number;
    }>;
    resetUserPassword(userId: string, newPassword: string, supervisorId: string): Promise<{
        message: string;
    }>;
    private canSupervisorResetPassword;
    private hashPassword;
}
