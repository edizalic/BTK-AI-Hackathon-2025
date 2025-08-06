import { GeminiService } from './gemini.service';
import { GetQuizDto, GetAssignmentDto, AskQuizQuestionDto, GetPersonalReportDto } from './dto/gemini.dto';
export declare class GeminiController {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
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
    getQuiz(courseId: string, getQuizDto: GetQuizDto): Promise<any>;
    getAssignment(courseId: string, getAssignmentDto: GetAssignmentDto): Promise<any>;
    askQuizQuestion(courseId: string, askQuizQuestionDto: AskQuizQuestionDto): Promise<any>;
    getPersonalReport(courseId: string, getPersonalReportDto: GetPersonalReportDto): Promise<any>;
}
