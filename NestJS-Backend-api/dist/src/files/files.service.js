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
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const storage_service_1 = require("./storage.service");
let FilesService = FilesService_1 = class FilesService {
    constructor(prisma, storageService, configService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.configService = configService;
        this.logger = new common_1.Logger(FilesService_1.name);
    }
    async uploadFile(file, uploaderId) {
        try {
            this.validateFile(file);
            const filePath = await this.storageService.saveFile(file);
            const fileRecord = await this.prisma.fileAttachment.create({
                data: {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: BigInt(file.size),
                    path: filePath,
                    uploadedById: uploaderId,
                },
                include: {
                    uploadedBy: {
                        include: { profile: true },
                    },
                },
            });
            await this.prisma.userActivity.create({
                data: {
                    userId: uploaderId,
                    action: 'upload_file',
                    details: {
                        fileId: fileRecord.id,
                        filename: file.originalname,
                        size: file.size,
                    },
                },
            });
            return fileRecord;
        }
        catch (error) {
            this.logger.error('Error uploading file:', error);
            throw new common_1.BadRequestException('Failed to upload file');
        }
    }
    async getFileMetadata(fileId) {
        return this.prisma.fileAttachment.findUnique({
            where: { id: fileId },
            include: {
                uploadedBy: {
                    include: { profile: true },
                },
            },
        });
    }
    async downloadFile(fileId, userId) {
        const file = await this.getFileMetadata(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const hasAccess = await this.validateFileAccess(fileId, userId);
        if (!hasAccess) {
            throw new common_1.BadRequestException('You do not have access to this file');
        }
        const stream = await this.storageService.getFileStream(file.path);
        await this.prisma.userActivity.create({
            data: {
                userId,
                action: 'download_file',
                details: {
                    fileId,
                    filename: file.originalName,
                },
            },
        });
        return { file, stream };
    }
    async deleteFile(fileId, userId) {
        const file = await this.getFileMetadata(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            const canDelete = user?.role === 'SUPERVISOR_TEACHER' ||
                user?.role === 'ADMIN' ||
                file.uploadedById === userId;
            if (!canDelete) {
                throw new common_1.BadRequestException('You cannot delete this file');
            }
        }
        try {
            await this.storageService.deleteFile(file.path);
            await this.prisma.fileAttachment.delete({
                where: { id: fileId },
            });
            if (userId) {
                await this.prisma.userActivity.create({
                    data: {
                        userId,
                        action: 'delete_file',
                        details: {
                            fileId,
                            filename: file.originalName,
                        },
                    },
                });
            }
        }
        catch (error) {
            this.logger.error('Error deleting file:', error);
            throw new common_1.BadRequestException('Failed to delete file');
        }
    }
    async validateFileAccess(fileId, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentEnrollments: true,
                taughtCourses: true,
                createdCourses: true,
            },
        });
        if (!user) {
            return false;
        }
        if (user.role === 'ADMIN' || user.role === 'SUPERVISOR_TEACHER') {
            return true;
        }
        const file = await this.prisma.fileAttachment.findUnique({
            where: { id: fileId },
            include: {
                courseMaterials: {
                    include: { course: true },
                },
                assignmentAttachments: {
                    include: { course: true },
                },
                submissionFiles: {
                    include: {
                        assignment: {
                            include: { course: true },
                        },
                    },
                },
            },
        });
        if (!file) {
            return false;
        }
        if (file.uploadedById === userId) {
            return true;
        }
        const accessibleCourseIds = new Set();
        user.studentEnrollments.forEach(enrollment => {
            if (enrollment.status === 'ACTIVE') {
                accessibleCourseIds.add(enrollment.courseId);
            }
        });
        user.taughtCourses.forEach(course => {
            accessibleCourseIds.add(course.id);
        });
        user.createdCourses.forEach(course => {
            accessibleCourseIds.add(course.id);
        });
        const fileCourseIds = [
            ...file.courseMaterials.map(material => material.course.id),
            ...file.assignmentAttachments.map(assignment => assignment.course.id),
            ...file.submissionFiles.map(submission => submission.assignment.course.id),
        ];
        return fileCourseIds.some(courseId => accessibleCourseIds.has(courseId));
    }
    validateFile(file) {
        const maxSize = this.configService.get('upload.maxFileSize') * 1024 * 1024;
        const allowedTypes = this.configService.get('upload.allowedFileTypes');
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
        }
        if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }
    async getUserFiles(userId) {
        return this.prisma.fileAttachment.findMany({
            where: { uploadedById: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getFileStats() {
        const files = await this.prisma.fileAttachment.findMany({
            select: {
                mimeType: true,
                fileSize: true,
            },
        });
        const filesByType = {};
        let totalSize = BigInt(0);
        files.forEach(file => {
            filesByType[file.mimeType] = (filesByType[file.mimeType] || 0) + 1;
            totalSize += file.fileSize;
        });
        return {
            totalFiles: files.length,
            totalSize,
            filesByType,
        };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map