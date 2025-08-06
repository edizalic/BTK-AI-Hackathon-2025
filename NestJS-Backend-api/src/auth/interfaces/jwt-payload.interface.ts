import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  isSupervisor: boolean;
  iat?: number; // Issued at
  exp?: number; // Expires at
}