import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('upload.uploadPath') || './uploads';
    this.ensureUploadDirectory();
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = file.filename || `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Create directory structure if needed
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });

      // If file has a buffer, write it
      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        // If file is already saved (by multer), move it
        await fs.rename(file.path, filePath);
      }

      this.logger.log(`File saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  async getFileStream(filePath: string): Promise<NodeJS.ReadableStream> {
    try {
      // Check if file exists
      await fs.access(filePath);
      return createReadStream(filePath);
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}:`, error);
      throw new Error('File not found or cannot be read');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Error deleting file ${filePath}:`, error);
      // Don't throw error for file deletion failures in storage
      // The database record should still be removed
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });

      await fs.rename(sourcePath, destinationPath);
      this.logger.log(`File moved from ${sourcePath} to ${destinationPath}`);
    } catch (error) {
      this.logger.error('Error moving file:', error);
      throw new Error('Failed to move file');
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });

      await fs.copyFile(sourcePath, destinationPath);
      this.logger.log(`File copied from ${sourcePath} to ${destinationPath}`);
    } catch (error) {
      this.logger.error('Error copying file:', error);
      throw new Error('Failed to copy file');
    }
  }

  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    modified?: Date;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
      this.logger.log(`Upload directory ensured: ${this.uploadPath}`);
    } catch (error) {
      this.logger.error('Error creating upload directory:', error);
    }
  }

  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const tempDir = path.join(this.uploadPath, 'temp');
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      try {
        const files = await fs.readdir(tempDir);
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            this.logger.log(`Cleaned up temp file: ${filePath}`);
          }
        }
      } catch (error) {
        // Temp directory might not exist, which is fine
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error('Error cleaning up temp files:', error);
    }
  }

  getUploadPath(): string {
    return this.uploadPath;
  }

  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    
    return `${nameWithoutExt}-${timestamp}-${random}${extension}`;
  }
}