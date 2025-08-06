import { PrismaService } from '../database/prisma.service';
export declare class SystemService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getSystemSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        value: string;
        key: string;
    }[]>;
    updateSystemSetting(key: string, value: string, type?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        value: string;
        key: string;
    }>;
    getSystemHealth(): Promise<{
        status: string;
        database: string;
        statistics: {
            users: number;
            courses: number;
            assignments: number;
        };
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        database: string;
        error: any;
        timestamp: string;
        statistics?: undefined;
    }>;
    generateSystemReport(startDate?: Date, endDate?: Date): Promise<{
        period: {
            start: string;
            end: string;
        };
        summary: {
            newUsers: number;
            newCourses: number;
            newAssignments: number;
            totalActivities: number;
        };
        generatedAt: string;
    }>;
}
