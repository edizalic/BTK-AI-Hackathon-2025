import { Grade } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeFiltersDto } from './dto/grade-filters.dto';
import { GradeCalculationService } from './grade-calculation.service';
export declare class GradesService {
    private readonly prisma;
    private readonly gradeCalculationService;
    private readonly logger;
    constructor(prisma: PrismaService, gradeCalculationService: GradeCalculationService);
    gradeAssignment(submissionId: string, gradeDto: CreateGradeDto, graderId: string): Promise<Grade>;
    updateGrade(gradeId: string, dto: UpdateGradeDto, graderId: string): Promise<Grade>;
    getGradesByStudent(studentId: string, filters?: GradeFiltersDto): Promise<any[]>;
    getGradesByCourse(courseId: string): Promise<Grade[]>;
    generateGradeReport(studentId: string, semester?: string, year?: number): Promise<any>;
}
