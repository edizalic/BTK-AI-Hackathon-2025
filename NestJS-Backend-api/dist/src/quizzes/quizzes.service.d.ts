import { Quiz } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
export declare class QuizzesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createQuiz(dto: CreateQuizDto, creatorId: string): Promise<Quiz>;
    getQuizzesByCourse(courseId: string): Promise<Quiz[]>;
    getQuizById(id: string): Promise<Quiz | null>;
    updateQuiz(id: string, dto: UpdateQuizDto, userId: string): Promise<Quiz>;
    deleteQuiz(id: string, userId: string): Promise<void>;
    getQuizzesByStudent(studentId: string): Promise<Quiz[]>;
    canStudentTakeQuiz(quizId: string, studentId: string): Promise<{
        canTake: boolean;
        reason?: string;
        attemptsLeft?: number;
    }>;
    getQuizStatistics(quizId: string): Promise<{
        totalAttempts: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        completionRate: number;
        scoreDistribution: Array<{
            range: string;
            count: number;
        }>;
    }>;
    getQuizAttempts(quizId: string, studentId?: string): Promise<any[]>;
    getQuizForStudent(id: string, studentId: string): Promise<any>;
    getQuizForTeacher(id: string, userId: string): Promise<Quiz>;
    gradeQuizAttempt(attemptId: string, studentAnswers: Record<string, number>): Promise<{
        score: number;
        maxPoints: number;
        results: any[];
    }>;
    getStudentWrongAnswers(studentId: string): Promise<any[]>;
    getStudentAllQuizAttempts(studentId: string): Promise<any[]>;
    private createGradeFromQuizAttempt;
    private calculateLetterGrade;
}
