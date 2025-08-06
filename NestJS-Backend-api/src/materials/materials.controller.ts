import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { MaterialsService } from './materials.service';
import { FilesService } from '../files/files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@ApiTags('Course Materials')
@Controller('materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly filesService: FilesService,
  ) {}

  @Post('course/:courseId')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload course material (teachers/supervisors)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Material uploaded successfully' })
  @AuditLog('UPLOAD_MATERIAL')
  async uploadMaterial(
    @Param('courseId') courseId: string,
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser() user: UserWithProfile,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileId: string | undefined;

    if (file) {
      const uploadedFile = await this.filesService.uploadFile(file, user.id);
      fileId = uploadedFile.id;
    }

    return this.materialsService.uploadMaterial(
      courseId,
      createMaterialDto,
      user.id,
      fileId,
    );
  }

  @Get('course/:courseId')
  @Public()
  @ApiOperation({ summary: 'Get course materials' })
  @ApiResponse({ status: 200, description: 'Materials retrieved successfully' })
  async getMaterialsByCourse(@Param('courseId') courseId: string) {
    return this.materialsService.getMaterialsByCourse(courseId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get material details' })
  @ApiResponse({ status: 200, description: 'Material details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async getMaterialById(@Param('id') id: string) {
    return this.materialsService.getMaterialById(id);
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Update material' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  @AuditLog('UPDATE_MATERIAL')
  async updateMaterial(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.materialsService.updateMaterial(id, updateMaterialDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Delete material' })
  @ApiResponse({ status: 200, description: 'Material deleted successfully' })
  @AuditLog('DELETE_MATERIAL')
  async deleteMaterial(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    await this.materialsService.deleteMaterial(id, user.id);
    return { message: 'Material deleted successfully' };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download material file' })
  @ApiResponse({ status: 200, description: 'Material download initiated' })
  async downloadMaterial(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.materialsService.downloadMaterial(id, user.id);
  }

  @Get('course/:courseId/type/:type')
  @Public()
  @ApiOperation({ summary: 'Get materials by type' })
  @ApiResponse({ status: 200, description: 'Materials retrieved successfully' })
  async getMaterialsByType(
    @Param('courseId') courseId: string,
    @Param('type') type: string,
  ) {
    return this.materialsService.getMaterialsByType(courseId, type);
  }

  @Get('course/:courseId/required')
  @Public()
  @ApiOperation({ summary: 'Get required materials for course' })
  @ApiResponse({ status: 200, description: 'Required materials retrieved successfully' })
  async getRequiredMaterials(@Param('courseId') courseId: string) {
    return this.materialsService.getRequiredMaterials(courseId);
  }
}