import { GradesService } from './grades.service';
import { GradeCalculationService } from './grade-calculation.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeFiltersDto } from './dto/grade-filters.dto';
export declare class GradesController {
    private readonly gradesService;
    private readonly gradeCalculationService;
    constructor(gradesService: GradesService, gradeCalculationService: GradeCalculationService);
    gradeAssignment(submissionId: string, createGradeDto: CreateGradeDto, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        courseId: string | null;
        maxPoints: number;
        assignmentId: string | null;
        submissionId: string | null;
        letterGrade: string;
        score: number;
        feedback: string | null;
        isExtraCredit: boolean;
        weight: number | null;
        gradingPeriod: string | null;
        percentage: number | null;
        gradedById: string;
        gradedDate: Date;
    }>;
    getStudentGrades(studentId: string, filters: GradeFiltersDto): Promise<any[]>;
    getCourseGrades(courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        courseId: string | null;
        maxPoints: number;
        assignmentId: string | null;
        submissionId: string | null;
        letterGrade: string;
        score: number;
        feedback: string | null;
        isExtraCredit: boolean;
        weight: number | null;
        gradingPeriod: string | null;
        percentage: number | null;
        gradedById: string;
        gradedDate: Date;
    }[]>;
    updateGrade(gradeId: string, updateGradeDto: UpdateGradeDto, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        courseId: string | null;
        maxPoints: number;
        assignmentId: string | null;
        submissionId: string | null;
        letterGrade: string;
        score: number;
        feedback: string | null;
        isExtraCredit: boolean;
        weight: number | null;
        gradingPeriod: string | null;
        percentage: number | null;
        gradedById: string;
        gradedDate: Date;
    }>;
    calculateStudentGPA(studentId: string, semester?: string, year?: string): Promise<{
        studentId: string;
        gpa: number;
        semester: string;
        year: number;
        calculatedAt: string;
    }>;
    generateGradeReport(studentId: string, semester?: string, year?: string): Promise<any>;
    getStudentTranscript(studentId: string): Promise<{
        student: any;
        courses: any[];
        overallGPA: number;
        totalCredits: number;
    }>;
    getCourseStatistics(courseId: string): Promise<{
        average: number;
        distribution: Record<string, number>;
        totalStudents: number;
    }>;
}
