import { UserRole } from '@prisma/client';
export declare class UserFiltersDto {
    role?: UserRole;
    isActive?: boolean;
    department?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
