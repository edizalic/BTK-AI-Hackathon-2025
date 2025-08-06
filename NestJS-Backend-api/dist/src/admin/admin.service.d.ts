import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateSupervisorDto } from '../users/dto/create-supervisor.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly usersService;
    private readonly logger;
    constructor(prisma: PrismaService, usersService: UsersService);
    registerSupervisor(dto: CreateSupervisorDto, adminId: string): Promise<import("../users/interfaces/user-with-profile.interface").UserWithProfile>;
    getSystemStats(): Promise<{
        users: {
            total: number;
            students: number;
            teachers: number;
            supervisors: number;
            admins: number;
            active: number;
            inactive: number;
        };
        courses: {
            total: number;
            active: number;
            completed: number;
        };
        assignments: {
            total: number;
            assigned: number;
            submitted: number;
            graded: number;
        };
        timestamp: string;
    }>;
    private getCourseStats;
    private getAssignmentStats;
}
