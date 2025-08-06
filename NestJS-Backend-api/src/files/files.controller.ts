import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { UserRole } from '@prisma/client';

import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @AuditLog('UPLOAD_FILE')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.filesService.uploadFile(file, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({ status: 200, description: 'File metadata retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileMetadata(@Param('id') id: string) {
    return this.filesService.getFileMetadata(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({ status: 200, description: 'File download initiated' })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, stream } = await this.filesService.downloadFile(id, user.id);

    // Set appropriate headers
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename=\"${file.originalName}\"`,
      'Content-Length': file.fileSize.toString(),
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @AuditLog('DELETE_FILE')
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    await this.filesService.deleteFile(id, user.id);
    return { message: 'File deleted successfully' };
  }

  @Get('user/my-files')
  @ApiOperation({ summary: 'Get current user files' })
  @ApiResponse({ status: 200, description: 'User files retrieved successfully' })
  async getUserFiles(@CurrentUser() user: UserWithProfile) {
    return this.filesService.getUserFiles(user.id);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get file statistics (admin/supervisors)' })
  @ApiResponse({ status: 200, description: 'File statistics retrieved successfully' })
  async getFileStats() {
    const stats = await this.filesService.getFileStats();
    
    // Convert BigInt to string for JSON serialization
    return {
      ...stats,
      totalSize: stats.totalSize.toString(),
    };
  }
}