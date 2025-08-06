import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getSystemSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        value: string;
        key: string;
    }[]>;
    updateSystemSettings(settings: any): Promise<any[]>;
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
    generateSystemReport(startDate?: string, endDate?: string): Promise<{
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
