import { PrismaService } from '../database/prisma.service';
export declare class GradeCalculationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateGPA(studentId: string, semester?: string, year?: number): Promise<number>;
    updateStudentGPA(studentId: string): Promise<void>;
    calculateCourseGrades(courseId: string): Promise<{
        average: number;
        distribution: Record<string, number>;
        totalStudents: number;
    }>;
    private convertLetterGradeToPoints;
    getStudentTranscript(studentId: string): Promise<{
        student: any;
        courses: any[];
        overallGPA: number;
        totalCredits: number;
    }>;
}
