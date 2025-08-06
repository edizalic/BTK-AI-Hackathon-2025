import { AssignmentSubmission } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
export declare class SubmissionsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    submitAssignment(assignmentId: string, studentId: string, submissionDto: SubmitAssignmentDto): Promise<AssignmentSubmission>;
    getSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null>;
    getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]>;
    getStudentSubmissions(studentId: string): Promise<AssignmentSubmission[]>;
    updateSubmission(assignmentId: string, studentId: string, submissionDto: SubmitAssignmentDto): Promise<AssignmentSubmission>;
}
