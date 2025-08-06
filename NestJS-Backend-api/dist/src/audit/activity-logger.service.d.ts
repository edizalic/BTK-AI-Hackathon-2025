import { AuditService } from './audit.service';
export declare class ActivityLoggerService {
    private readonly auditService;
    private readonly logger;
    constructor(auditService: AuditService);
    logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logUserLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logFailedLogin(email: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logUserRegistration(registeredUserId: string, registrarId: string, userRole: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logCourseCreation(courseId: string, creatorId: string, courseData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logAssignmentCreation(assignmentId: string, creatorId: string, courseId: string, assignmentData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logAssignmentSubmission(submissionId: string, studentId: string, assignmentId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logGradeAssignment(gradeId: string, graderId: string, studentId: string, assignmentId: string, gradeData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logFileUpload(fileId: string, uploaderId: string, fileName: string, fileSize: number, ipAddress?: string, userAgent?: string): Promise<void>;
    logFileDownload(fileId: string, downloaderId: string, fileName: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logPermissionDenied(userId: string | null, resource: string, action: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logSystemEvent(event: string, details: any, ipAddress?: string, userAgent?: string): Promise<void>;
}
