import { CourseMaterial } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    uploadMaterial(courseId: string, dto: CreateMaterialDto, uploaderId: string, fileId?: string): Promise<CourseMaterial>;
    getMaterialsByCourse(courseId: string): Promise<CourseMaterial[]>;
    getMaterialById(id: string): Promise<any | null>;
    updateMaterial(id: string, dto: UpdateMaterialDto, userId: string): Promise<CourseMaterial>;
    deleteMaterial(id: string, userId: string): Promise<void>;
    downloadMaterial(id: string, userId: string): Promise<CourseMaterial>;
    getMaterialsByType(courseId: string, type: string): Promise<CourseMaterial[]>;
    getRequiredMaterials(courseId: string): Promise<CourseMaterial[]>;
}
