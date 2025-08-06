import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        filename: string;
        originalName: string;
        mimeType: string;
        fileSize: bigint;
        uploadedById: string;
    }>;
    getFileMetadata(id: string): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        filename: string;
        originalName: string;
        mimeType: string;
        fileSize: bigint;
        uploadedById: string;
    }>;
    downloadFile(id: string, user: UserWithProfile, res: Response): Promise<StreamableFile>;
    deleteFile(id: string, user: UserWithProfile): Promise<{
        message: string;
    }>;
    getUserFiles(user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        filename: string;
        originalName: string;
        mimeType: string;
        fileSize: bigint;
        uploadedById: string;
    }[]>;
    getFileStats(): Promise<{
        totalSize: string;
        totalFiles: number;
        filesByType: Record<string, number>;
    }>;
}
