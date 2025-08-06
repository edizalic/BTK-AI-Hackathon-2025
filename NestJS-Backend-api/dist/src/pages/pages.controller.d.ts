import { PagesService } from './pages.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    getPageConfig(pageId: string, user: UserWithProfile): Promise<{
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
    getAvailablePages(user: UserWithProfile): Promise<{
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
