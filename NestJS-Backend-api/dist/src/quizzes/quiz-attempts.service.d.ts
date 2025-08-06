import { PrismaService } from '../database/prisma.service';
export declare class QuizAttemptsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    startQuizAttempt(quizId: string, studentId: string): Promise<any>;
    submitQuizAttempt(attemptId: string, answers: Record<string, any>, studentId: string): Promise<any>;
    getStudentAttempts(quizId: string, studentId: string): Promise<any[]>;
    getAttemptById(attemptId: string, userId: string): Promise<any>;
    private parseDuration;
    private calculateScore;
    private getQuizWithQuestionsForStudent;
    private createGradeFromQuizAttempt;
    private calculateLetterGrade;
}
