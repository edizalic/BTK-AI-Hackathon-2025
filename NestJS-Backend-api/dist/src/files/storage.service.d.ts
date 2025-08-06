import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly uploadPath;
    constructor(configService: ConfigService);
    saveFile(file: Express.Multer.File): Promise<string>;
    getFileStream(filePath: string): Promise<NodeJS.ReadableStream>;
    deleteFile(filePath: string): Promise<void>;
    moveFile(sourcePath: string, destinationPath: string): Promise<void>;
    copyFile(sourcePath: string, destinationPath: string): Promise<void>;
    getFileInfo(filePath: string): Promise<{
        exists: boolean;
        size?: number;
        modified?: Date;
    }>;
    ensureUploadDirectory(): Promise<void>;
    cleanupTempFiles(olderThanHours?: number): Promise<void>;
    getUploadPath(): string;
    generateUniqueFileName(originalName: string): string;
}
