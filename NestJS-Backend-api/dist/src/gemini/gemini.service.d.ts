import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
export declare class GeminiService {
    private readonly prisma;
    private readonly configService;
    private geminiModel;
    constructor(prisma: PrismaService, configService: ConfigService);
    private parseAIResponse;
    getWeeklyStudyPlan(courseId: string): Promise<{
        studyPlan: any;
        metadata: {
            generatedAt: Date;
            totalWeeks: number;
            currentWeek: number;
            note?: undefined;
        };
    } | {
        studyPlan: any[];
        metadata: {
            generatedAt: Date;
            totalWeeks: number;
            currentWeek: number;
            note: string;
        };
    }>;
}
