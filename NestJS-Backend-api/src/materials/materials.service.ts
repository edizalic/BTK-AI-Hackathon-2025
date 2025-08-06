import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { CourseMaterial, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async uploadMaterial(
    courseId: string,
    dto: CreateMaterialDto,
    uploaderId: string,
    fileId?: string,
  ): Promise<CourseMaterial> {
    try {
      // Verify uploader can manage the course
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true, createdBy: true },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      const uploader = await this.prisma.user.findUnique({
        where: { id: uploaderId },
      });

      if (!uploader) {
        throw new NotFoundException('Uploader not found');
      }

      // Check if uploader can upload materials for this course
      const canUpload = uploader.role === UserRole.SUPERVISOR_TEACHER || 
                       course.instructorId === uploaderId ||
                       course.createdById === uploaderId;

      if (!canUpload) {
        throw new ForbiddenException('You cannot upload materials for this course');
      }

      return await this.prisma.courseMaterial.create({
        data: {
          courseId,
          uploadedById: uploaderId,
          title: dto.title,
          description: dto.description,
          type: dto.type,
          isRequired: dto.isRequired || false,
          fileId,
          url: dto.url,
        },
        include: {
          course: {
            include: { department: true },
          },
          uploadedBy: {
            include: { profile: true },
          },
          file: true,
        },
      });
    } catch (error) {
      this.logger.error('Error uploading material:', error);
      throw error;
    }
  }

  async getMaterialsByCourse(courseId: string): Promise<CourseMaterial[]> {
    return this.prisma.courseMaterial.findMany({
      where: { courseId },
      include: {
        uploadedBy: {
          include: { profile: true },
        },
        file: true,
      },
      orderBy: [
        { isRequired: 'desc' },
        { uploadDate: 'desc' },
      ],
    });
  }

  async getMaterialById(id: string): Promise<any | null> {
    return this.prisma.courseMaterial.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
            instructor: {
              include: { profile: true },
            },
          },
        },
        uploadedBy: {
          include: { profile: true },
        },
        file: true,
      },
    });
  }

  async updateMaterial(id: string, dto: UpdateMaterialDto, userId: string): Promise<CourseMaterial> {
    const material = await this.getMaterialById(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Check if user can update this material
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canUpdate = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     material.uploadedById === userId ||
                     material.course.instructorId === userId;

    if (!canUpdate) {
      throw new ForbiddenException('You cannot update this material');
    }

    return this.prisma.courseMaterial.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        isRequired: dto.isRequired,
        url: dto.url,
      },
      include: {
        course: {
          include: { department: true },
        },
        uploadedBy: {
          include: { profile: true },
        },
        file: true,
      },
    });
  }

  async deleteMaterial(id: string, userId: string): Promise<void> {
    const material = await this.getMaterialById(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Check if user can delete this material
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canDelete = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     material.uploadedById === userId ||
                     material.course.instructorId === userId;

    if (!canDelete) {
      throw new ForbiddenException('You cannot delete this material');
    }

    await this.prisma.courseMaterial.delete({
      where: { id },
    });
  }

  async downloadMaterial(id: string, userId: string): Promise<CourseMaterial> {
    const material = await this.getMaterialById(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Check if user has access to this material
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentEnrollments: {
          where: { 
            courseId: material.courseId,
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check access permissions
    const hasAccess = user.role === UserRole.SUPERVISOR_TEACHER ||
                     user.role === UserRole.ADMIN ||
                     material.course.instructorId === userId ||
                     material.uploadedById === userId ||
                     user.studentEnrollments.length > 0;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this material');
    }

    // Log download activity
    await this.prisma.userActivity.create({
      data: {
        userId,
        action: 'download_material',
        details: {
          materialId: id,
          courseId: material.courseId,
        },
      },
    });

    return material;
  }

  async getMaterialsByType(courseId: string, type: string): Promise<CourseMaterial[]> {
    return this.prisma.courseMaterial.findMany({
      where: { 
        courseId,
        type: type as any,
      },
      include: {
        uploadedBy: {
          include: { profile: true },
        },
        file: true,
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });
  }

  async getRequiredMaterials(courseId: string): Promise<CourseMaterial[]> {
    return this.prisma.courseMaterial.findMany({
      where: { 
        courseId,
        isRequired: true,
      },
      include: {
        uploadedBy: {
          include: { profile: true },
        },
        file: true,
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });
  }
}