import { AssignmentType, AssignmentStatus } from '@prisma/client';
export declare class AssignmentFiltersDto {
    courseId?: string;
    status?: AssignmentStatus;
    type?: AssignmentType;
    studentId?: string;
}
