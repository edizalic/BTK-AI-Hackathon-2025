import { UserProfile } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export declare class ProfileService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<UserProfile | null>;
    updateProfile(userId: string, updateData: any): Promise<UserProfile>;
    createProfile(userId: string, profileData: any): Promise<UserProfile>;
}
