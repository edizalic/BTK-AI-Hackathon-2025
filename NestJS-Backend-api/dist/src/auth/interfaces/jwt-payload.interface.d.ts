import { UserRole } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    isSupervisor: boolean;
    iat?: number;
    exp?: number;
}
