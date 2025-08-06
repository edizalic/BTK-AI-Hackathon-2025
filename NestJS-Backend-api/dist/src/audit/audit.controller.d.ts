import { AuditService } from './audit.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getActivityLogs(filters: AuditFiltersDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    generateAuditReport(filters: AuditFiltersDto): Promise<{
        summary: {
            totalActivities: number;
            uniqueUsers: number;
            mostCommonActions: Array<{
                action: string;
                count: number;
            }>;
            activityByDate: Array<{
                date: string;
                count: number;
            }>;
        };
        activities: import(".prisma/client").AuditLog[];
    }>;
    getSecurityEvents(filters: AuditFiltersDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getUserActivitySummary(userId: string, days?: string): Promise<{
        totalActivities: number;
        actionBreakdown: Array<{
            action: string;
            count: number;
        }>;
        mostActiveDay: string;
        averageActivitiesPerDay: number;
    }>;
    cleanupOldLogs(days?: string): Promise<{
        deletedCount: number;
    }>;
}
