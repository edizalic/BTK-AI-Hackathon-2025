import { AdminService } from './admin.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateSupervisorDto } from '../users/dto/create-supervisor.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    registerSupervisor(createSupervisorDto: CreateSupervisorDto, user: UserWithProfile): Promise<UserWithProfile>;
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
}
