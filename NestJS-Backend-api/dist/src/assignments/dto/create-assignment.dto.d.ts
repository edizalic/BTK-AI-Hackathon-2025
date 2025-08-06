import { AssignmentType } from '@prisma/client';
export declare class CreateAssignmentDto {
    courseId: string;
    title: string;
    description: string;
    type: AssignmentType;
    dueDate: string;
    maxPoints: number;
    isGroupWork?: boolean;
    attachmentIds?: string[];
}
