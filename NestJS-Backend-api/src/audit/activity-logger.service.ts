import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from './audit.service';

@Injectable()
export class ActivityLoggerService {
  private readonly logger = new Logger(ActivityLoggerService.name);

  constructor(private readonly auditService: AuditService) {}

  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await this.auditService.logActivity(
        userId,
        'USER_LOGIN',
        'authentication',
        userId,
        null,
        { timestamp: new Date().toISOString() },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging user login:', error);
    }
  }

  async logUserLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await this.auditService.logActivity(
        userId,
        'USER_LOGOUT',
        'authentication',
        userId,
        null,
        { timestamp: new Date().toISOString() },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging user logout:', error);
    }
  }

  async logFailedLogin(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await this.auditService.logActivity(
        null,
        'FAILED_LOGIN',
        'authentication',
        null,
        null,
        { email, timestamp: new Date().toISOString() },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging failed login:', error);
    }
  }

  async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await this.auditService.logActivity(
        userId,
        'PASSWORD_CHANGE',
        'users',
        userId,
        null,
        { timestamp: new Date().toISOString() },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging password change:', error);
    }
  }

  async logUserRegistration(
    registeredUserId: string,
    registrarId: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        registrarId,
        'USER_REGISTRATION',
        'users',
        registeredUserId,
        null,
        {
          registeredUserId,
          userRole,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging user registration:', error);
    }
  }

  async logCourseCreation(
    courseId: string,
    creatorId: string,
    courseData: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        creatorId,
        'COURSE_CREATION',
        'courses',
        courseId,
        null,
        {
          courseName: courseData.name,
          courseCode: courseData.code,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging course creation:', error);
    }
  }

  async logAssignmentCreation(
    assignmentId: string,
    creatorId: string,
    courseId: string,
    assignmentData: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        creatorId,
        'ASSIGNMENT_CREATION',
        'assignments',
        assignmentId,
        null,
        {
          assignmentTitle: assignmentData.title,
          courseId,
          dueDate: assignmentData.dueDate,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging assignment creation:', error);
    }
  }

  async logAssignmentSubmission(
    submissionId: string,
    studentId: string,
    assignmentId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        studentId,
        'ASSIGNMENT_SUBMISSION',
        'assignment_submissions',
        submissionId,
        null,
        {
          assignmentId,
          submissionTime: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging assignment submission:', error);
    }
  }

  async logGradeAssignment(
    gradeId: string,
    graderId: string,
    studentId: string,
    assignmentId: string,
    gradeData: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        graderId,
        'GRADE_ASSIGNMENT',
        'grades',
        gradeId,
        null,
        {
          studentId,
          assignmentId,
          score: gradeData.score,
          maxPoints: gradeData.maxPoints,
          letterGrade: gradeData.letterGrade,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging grade assignment:', error);
    }
  }

  async logFileUpload(
    fileId: string,
    uploaderId: string,
    fileName: string,
    fileSize: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        uploaderId,
        'FILE_UPLOAD',
        'files',
        fileId,
        null,
        {
          fileName,
          fileSize,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging file upload:', error);
    }
  }

  async logFileDownload(
    fileId: string,
    downloaderId: string,
    fileName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        downloaderId,
        'FILE_DOWNLOAD',
        'files',
        fileId,
        null,
        {
          fileName,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging file download:', error);
    }
  }

  async logPermissionDenied(
    userId: string | null,
    resource: string,
    action: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logActivity(
        userId,
        'PERMISSION_DENIED',
        resource,
        null,
        null,
        {
          attemptedAction: action,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging permission denied:', error);
    }
  }

  async logSystemEvent(
    event: string,
    details: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditService.logSystemEvent(
        event,
        {
          ...details,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error('Error logging system event:', error);
    }
  }
}