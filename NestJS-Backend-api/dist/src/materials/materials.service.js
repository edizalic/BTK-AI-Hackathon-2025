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
var MaterialsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let MaterialsService = MaterialsService_1 = class MaterialsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MaterialsService_1.name);
    }
    async uploadMaterial(courseId, dto, uploaderId, fileId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            const uploader = await this.prisma.user.findUnique({
                where: { id: uploaderId },
            });
            if (!uploader) {
                throw new common_1.NotFoundException('Uploader not found');
            }
            const canUpload = uploader.role === client_1.UserRole.SUPERVISOR_TEACHER ||
                course.instructorId === uploaderId ||
                course.createdById === uploaderId;
            if (!canUpload) {
                throw new common_1.ForbiddenException('You cannot upload materials for this course');
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
        }
        catch (error) {
            this.logger.error('Error uploading material:', error);
            throw error;
        }
    }
    async getMaterialsByCourse(courseId) {
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
    async getMaterialById(id) {
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
    async updateMaterial(id, dto, userId) {
        const material = await this.getMaterialById(id);
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canUpdate = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            material.uploadedById === userId ||
            material.course.instructorId === userId;
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You cannot update this material');
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
    async deleteMaterial(id, userId) {
        const material = await this.getMaterialById(id);
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canDelete = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            material.uploadedById === userId ||
            material.course.instructorId === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You cannot delete this material');
        }
        await this.prisma.courseMaterial.delete({
            where: { id },
        });
    }
    async downloadMaterial(id, userId) {
        const material = await this.getMaterialById(id);
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
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
            throw new common_1.NotFoundException('User not found');
        }
        const hasAccess = user.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            user.role === client_1.UserRole.ADMIN ||
            material.course.instructorId === userId ||
            material.uploadedById === userId ||
            user.studentEnrollments.length > 0;
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this material');
        }
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
    async getMaterialsByType(courseId, type) {
        return this.prisma.courseMaterial.findMany({
            where: {
                courseId,
                type: type,
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
    async getRequiredMaterials(courseId) {
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
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = MaterialsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map