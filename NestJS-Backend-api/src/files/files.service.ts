import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { FileAttachment } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, uploaderId: string): Promise<FileAttachment> {
    try {
      // Validate file
      this.validateFile(file);

      // Save file to storage
      const filePath = await this.storageService.saveFile(file);

      // Create file record
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

      // Log activity
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
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getFileMetadata(fileId: string): Promise<FileAttachment | null> {
    return this.prisma.fileAttachment.findUnique({
      where: { id: fileId },
      include: {
        uploadedBy: {
          include: { profile: true },
        },
      },
    });
  }

  async downloadFile(fileId: string, userId: string): Promise<{
    file: FileAttachment;
    stream: any;
  }> {
    const file = await this.getFileMetadata(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Validate file access
    const hasAccess = await this.validateFileAccess(fileId, userId);
    if (!hasAccess) {
      throw new BadRequestException('You do not have access to this file');
    }

    // Get file stream from storage
    const stream = await this.storageService.getFileStream(file.path);

    // Log download activity
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

  async deleteFile(fileId: string, userId?: string): Promise<void> {
    const file = await this.getFileMetadata(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // If userId is provided, check if user can delete this file
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const canDelete = user?.role === 'SUPERVISOR_TEACHER' ||
                       user?.role === 'ADMIN' ||
                       file.uploadedById === userId;

      if (!canDelete) {
        throw new BadRequestException('You cannot delete this file');
      }
    }

    try {
      // Delete from storage
      await this.storageService.deleteFile(file.path);

      // Delete from database
      await this.prisma.fileAttachment.delete({
        where: { id: fileId },
      });

      // Log activity
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
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  async validateFileAccess(fileId: string, userId: string): Promise<boolean> {
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

    // Admins and supervisors have access to all files
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

    // User uploaded the file
    if (file.uploadedById === userId) {
      return true;
    }

    // Check if user has access through course enrollment or teaching
    const accessibleCourseIds = new Set<string>();

    // Add courses user is enrolled in
    user.studentEnrollments.forEach(enrollment => {
      if (enrollment.status === 'ACTIVE') {
        accessibleCourseIds.add(enrollment.courseId);
      }
    });

    // Add courses user teaches
    user.taughtCourses.forEach(course => {
      accessibleCourseIds.add(course.id);
    });

    // Add courses user created
    user.createdCourses.forEach(course => {
      accessibleCourseIds.add(course.id);
    });

    // Check if file belongs to any accessible course
    const fileCourseIds = [
      ...file.courseMaterials.map(material => material.course.id),
      ...file.assignmentAttachments.map(assignment => assignment.course.id),
      ...file.submissionFiles.map(submission => submission.assignment.course.id),
    ];

    return fileCourseIds.some(courseId => accessibleCourseIds.has(courseId));
  }

  private validateFile(file: Express.Multer.File): void {
    const maxSize = this.configService.get<number>('upload.maxFileSize') * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = this.configService.get<string[]>('upload.allowedFileTypes');

    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  async getUserFiles(userId: string): Promise<FileAttachment[]> {
    return this.prisma.fileAttachment.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: bigint;
    filesByType: Record<string, number>;
  }> {
    const files = await this.prisma.fileAttachment.findMany({
      select: {
        mimeType: true,
        fileSize: true,
      },
    });

    const filesByType: Record<string, number> = {};
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
}