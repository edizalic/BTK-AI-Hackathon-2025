"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ActivityLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLoggerService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
let ActivityLoggerService = ActivityLoggerService_1 = class ActivityLoggerService {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(ActivityLoggerService_1.name);
    }
    async logUserLogin(userId, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(userId, 'USER_LOGIN', 'authentication', userId, null, { timestamp: new Date().toISOString() }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging user login:', error);
        }
    }
    async logUserLogout(userId, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(userId, 'USER_LOGOUT', 'authentication', userId, null, { timestamp: new Date().toISOString() }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging user logout:', error);
        }
    }
    async logFailedLogin(email, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(null, 'FAILED_LOGIN', 'authentication', null, null, { email, timestamp: new Date().toISOString() }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging failed login:', error);
        }
    }
    async logPasswordChange(userId, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(userId, 'PASSWORD_CHANGE', 'users', userId, null, { timestamp: new Date().toISOString() }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging password change:', error);
        }
    }
    async logUserRegistration(registeredUserId, registrarId, userRole, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(registrarId, 'USER_REGISTRATION', 'users', registeredUserId, null, {
                registeredUserId,
                userRole,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging user registration:', error);
        }
    }
    async logCourseCreation(courseId, creatorId, courseData, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(creatorId, 'COURSE_CREATION', 'courses', courseId, null, {
                courseName: courseData.name,
                courseCode: courseData.code,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging course creation:', error);
        }
    }
    async logAssignmentCreation(assignmentId, creatorId, courseId, assignmentData, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(creatorId, 'ASSIGNMENT_CREATION', 'assignments', assignmentId, null, {
                assignmentTitle: assignmentData.title,
                courseId,
                dueDate: assignmentData.dueDate,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging assignment creation:', error);
        }
    }
    async logAssignmentSubmission(submissionId, studentId, assignmentId, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(studentId, 'ASSIGNMENT_SUBMISSION', 'assignment_submissions', submissionId, null, {
                assignmentId,
                submissionTime: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging assignment submission:', error);
        }
    }
    async logGradeAssignment(gradeId, graderId, studentId, assignmentId, gradeData, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(graderId, 'GRADE_ASSIGNMENT', 'grades', gradeId, null, {
                studentId,
                assignmentId,
                score: gradeData.score,
                maxPoints: gradeData.maxPoints,
                letterGrade: gradeData.letterGrade,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging grade assignment:', error);
        }
    }
    async logFileUpload(fileId, uploaderId, fileName, fileSize, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(uploaderId, 'FILE_UPLOAD', 'files', fileId, null, {
                fileName,
                fileSize,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging file upload:', error);
        }
    }
    async logFileDownload(fileId, downloaderId, fileName, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(downloaderId, 'FILE_DOWNLOAD', 'files', fileId, null, {
                fileName,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging file download:', error);
        }
    }
    async logPermissionDenied(userId, resource, action, ipAddress, userAgent) {
        try {
            await this.auditService.logActivity(userId, 'PERMISSION_DENIED', resource, null, null, {
                attemptedAction: action,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging permission denied:', error);
        }
    }
    async logSystemEvent(event, details, ipAddress, userAgent) {
        try {
            await this.auditService.logSystemEvent(event, {
                ...details,
                timestamp: new Date().toISOString(),
            }, ipAddress, userAgent);
        }
        catch (error) {
            this.logger.error('Error logging system event:', error);
        }
    }
};
exports.ActivityLoggerService = ActivityLoggerService;
exports.ActivityLoggerService = ActivityLoggerService = ActivityLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], ActivityLoggerService);
//# sourceMappingURL=activity-logger.service.js.map