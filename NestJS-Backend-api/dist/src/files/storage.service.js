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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs/promises");
const path = require("path");
const fs_1 = require("fs");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.uploadPath = this.configService.get('upload.uploadPath') || './uploads';
        this.ensureUploadDirectory();
    }
    async saveFile(file) {
        try {
            const fileName = file.filename || `${Date.now()}-${file.originalname}`;
            const filePath = path.join(this.uploadPath, fileName);
            const dirPath = path.dirname(filePath);
            await fs.mkdir(dirPath, { recursive: true });
            if (file.buffer) {
                await fs.writeFile(filePath, file.buffer);
            }
            else if (file.path) {
                await fs.rename(file.path, filePath);
            }
            this.logger.log(`File saved: ${filePath}`);
            return filePath;
        }
        catch (error) {
            this.logger.error('Error saving file:', error);
            throw new Error('Failed to save file');
        }
    }
    async getFileStream(filePath) {
        try {
            await fs.access(filePath);
            return (0, fs_1.createReadStream)(filePath);
        }
        catch (error) {
            this.logger.error(`Error reading file ${filePath}:`, error);
            throw new Error('File not found or cannot be read');
        }
    }
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            this.logger.log(`File deleted: ${filePath}`);
        }
        catch (error) {
            this.logger.warn(`Error deleting file ${filePath}:`, error);
        }
    }
    async moveFile(sourcePath, destinationPath) {
        try {
            const destDir = path.dirname(destinationPath);
            await fs.mkdir(destDir, { recursive: true });
            await fs.rename(sourcePath, destinationPath);
            this.logger.log(`File moved from ${sourcePath} to ${destinationPath}`);
        }
        catch (error) {
            this.logger.error('Error moving file:', error);
            throw new Error('Failed to move file');
        }
    }
    async copyFile(sourcePath, destinationPath) {
        try {
            const destDir = path.dirname(destinationPath);
            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(sourcePath, destinationPath);
            this.logger.log(`File copied from ${sourcePath} to ${destinationPath}`);
        }
        catch (error) {
            this.logger.error('Error copying file:', error);
            throw new Error('Failed to copy file');
        }
    }
    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                exists: true,
                size: stats.size,
                modified: stats.mtime,
            };
        }
        catch (error) {
            return { exists: false };
        }
    }
    async ensureUploadDirectory() {
        try {
            await fs.mkdir(this.uploadPath, { recursive: true });
            this.logger.log(`Upload directory ensured: ${this.uploadPath}`);
        }
        catch (error) {
            this.logger.error('Error creating upload directory:', error);
        }
    }
    async cleanupTempFiles(olderThanHours = 24) {
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
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }
        }
        catch (error) {
            this.logger.error('Error cleaning up temp files:', error);
        }
    }
    getUploadPath() {
        return this.uploadPath;
    }
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const extension = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, extension);
        return `${nameWithoutExt}-${timestamp}-${random}${extension}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map