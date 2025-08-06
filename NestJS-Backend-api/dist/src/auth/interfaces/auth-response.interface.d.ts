import { UserRole } from '@prisma/client';
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
        isSupervisor: boolean;
        profile?: {
            firstName: string;
            lastName: string;
            avatar?: string;
        };
    };
}
