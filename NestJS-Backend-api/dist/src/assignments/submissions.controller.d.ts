import { SubmissionsService } from './submissions.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    submitAssignment(assignmentId: string, submitAssignmentDto: SubmitAssignmentDto, user: UserWithProfile): Promise<{
        id: string;
        studentId: string;
        textContent: string | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
    getAssignmentSubmissions(assignmentId: string): Promise<{
        id: string;
        studentId: string;
        textContent: string | null;
        assignmentId: string;
        submittedAt: Date;
    }[]>;
    getMySubmission(assignmentId: string, user: UserWithProfile): Promise<{
        id: string;
        studentId: string;
        textContent: string | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
    updateSubmission(assignmentId: string, submitAssignmentDto: SubmitAssignmentDto, user: UserWithProfile): Promise<{
        id: string;
        studentId: string;
        textContent: string | null;
        assignmentId: string;
        submittedAt: Date;
    }>;
    getStudentSubmissions(studentId: string): Promise<{
        id: string;
        studentId: string;
        textContent: string | null;
        assignmentId: string;
        submittedAt: Date;
    }[]>;
}
