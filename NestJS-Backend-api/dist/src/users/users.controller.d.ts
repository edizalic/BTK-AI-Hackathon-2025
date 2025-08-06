import { UsersService } from './users.service';
import { UserWithProfile } from './interfaces/user-with-profile.interface';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UserFiltersDto } from './dto/user-filters.dto';
import { AssignAdvisoryDto } from './dto/assign-advisory.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createStudent(createStudentDto: CreateStudentDto, user: UserWithProfile): Promise<UserWithProfile>;
    createTeacher(createTeacherDto: CreateTeacherDto, user: UserWithProfile): Promise<UserWithProfile>;
    createSupervisor(createSupervisorDto: CreateSupervisorDto, user: UserWithProfile): Promise<UserWithProfile>;
    findAll(filters: UserFiltersDto): Promise<UserWithProfile[]>;
    findOne(id: string): Promise<UserWithProfile>;
    assignAdvisoryTeacher(studentId: string, assignAdvisoryDto: AssignAdvisoryDto, user: UserWithProfile): Promise<void>;
    getUserStats(): Promise<{
        total: number;
        students: number;
        teachers: number;
        supervisors: number;
        admins: number;
        active: number;
        inactive: number;
    }>;
    resetUserPassword(userId: string, resetPasswordDto: ResetPasswordDto, supervisor: UserWithProfile): Promise<{
        message: string;
    }>;
}
