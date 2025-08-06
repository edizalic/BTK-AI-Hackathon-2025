import { AuditLog } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logActivity(userId: string | null, action: string, resource: string, resourceId?: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog>;
    logSystemEvent(action: string, details: any, ipAddress?: string, userAgent?: string): Promise<AuditLog>;
    getActivityLogs(filters?: AuditFiltersDto): Promise<AuditLog[]>;
    generateAuditReport(filters?: AuditFiltersDto): Promise<{
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
        activities: AuditLog[];
    }>;
    getSecurityEvents(filters?: AuditFiltersDto): Promise<AuditLog[]>;
    getUserActivitySummary(userId: string, days?: number): Promise<{
        totalActivities: number;
        actionBreakdown: Array<{
            action: string;
            count: number;
        }>;
        mostActiveDay: string;
        averageActivitiesPerDay: number;
    }>;
    cleanupOldLogs(olderThanDays?: number): Promise<{
        deletedCount: number;
    }>;
}
