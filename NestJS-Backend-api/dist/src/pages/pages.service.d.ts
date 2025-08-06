import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export declare class PagesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getPageConfig(pageId: string, userRole: UserRole): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        userType: import(".prisma/client").$Enums.UserRole | null;
        layoutType: string;
        layoutClass: string | null;
        sections: import("@prisma/client/runtime/library").JsonValue;
        requiresAuth: boolean;
        permissions: string[];
        requiresSupervisor: boolean;
    }>;
    getAvailablePages(userRole: UserRole, permissions?: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        userType: import(".prisma/client").$Enums.UserRole | null;
        layoutType: string;
        layoutClass: string | null;
        sections: import("@prisma/client/runtime/library").JsonValue;
        requiresAuth: boolean;
        permissions: string[];
        requiresSupervisor: boolean;
    }[]>;
}
