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
    getQuiz(courseId: string, weeksToCover: number[]): Promise<any>;
    getAssignment(courseId: string, weeksToCover: number[]): Promise<any>;
    askQuizQuestion(courseId: string, question: string): Promise<any>;
    getPersonalReport(courseId: string, studentId: string): Promise<any>;
}
