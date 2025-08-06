import { Course } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plan.dto';
export declare class CoursesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createCourse(dto: CreateCourseDto, supervisorId: string): Promise<Course>;
    findAll(filters?: any): Promise<Course[]>;
    findById(id: string): Promise<Course | null>;
    getCoursesByInstructor(teacherId: string): Promise<Course[]>;
    getCoursesByStudent(studentId: string): Promise<Course[]>;
    createStudyPlan(courseId: string, dto: CreateStudyPlanDto, userId: string): Promise<Course>;
    getStudyPlan(courseId: string): Promise<any>;
    updateStudyPlan(courseId: string, dto: UpdateStudyPlanDto, userId: string): Promise<Course>;
    deleteStudyPlan(courseId: string, userId: string): Promise<Course>;
}
