import { FileAttachment } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from './storage.service';
export declare class FilesService {
    private readonly prisma;
    private readonly storageService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService, configService: ConfigService);
    uploadFile(file: Express.Multer.File, uploaderId: string): Promise<FileAttachment>;
    getFileMetadata(fileId: string): Promise<FileAttachment | null>;
    downloadFile(fileId: string, userId: string): Promise<{
        file: FileAttachment;
        stream: any;
    }>;
    deleteFile(fileId: string, userId?: string): Promise<void>;
    validateFileAccess(fileId: string, userId: string): Promise<boolean>;
    private validateFile;
    getUserFiles(userId: string): Promise<FileAttachment[]>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalSize: bigint;
        filesByType: Record<string, number>;
    }>;
}
