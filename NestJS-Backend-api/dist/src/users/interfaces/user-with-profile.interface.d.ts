import { User, UserProfile } from '@prisma/client';
export interface UserWithProfile extends Omit<User, 'passwordHash'> {
    profile?: UserProfile | null;
}
