import { CourseLevel } from '@prisma/client';
import { StudyPlanWeekDto } from './study-plan.dto';
export declare class CreateCourseDto {
    code: string;
    name: string;
    description: string;
    credits: number;
    scheduleDays: string[];
    startTime: string;
    endTime: string;
    location: string;
    building?: string;
    room?: string;
    instructorId: string;
    semester: string;
    year: number;
    capacity: number;
    category: string;
    departmentId: string;
    level: CourseLevel;
    startDate: string;
    endDate: string;
    enrollmentDeadline?: string;
    studyPlan?: StudyPlanWeekDto[];
}
