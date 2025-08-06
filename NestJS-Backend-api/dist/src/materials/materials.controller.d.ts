import { MaterialsService } from './materials.service';
import { FilesService } from '../files/files.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsController {
    private readonly materialsService;
    private readonly filesService;
    constructor(materialsService: MaterialsService, filesService: FilesService);
    uploadMaterial(courseId: string, createMaterialDto: CreateMaterialDto, user: UserWithProfile, file?: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }>;
    getMaterialsByCourse(courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }[]>;
    getMaterialById(id: string): Promise<any>;
    updateMaterial(id: string, updateMaterialDto: UpdateMaterialDto, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }>;
    deleteMaterial(id: string, user: UserWithProfile): Promise<{
        message: string;
    }>;
    downloadMaterial(id: string, user: UserWithProfile): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }>;
    getMaterialsByType(courseId: string, type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }[]>;
    getRequiredMaterials(courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.MaterialType;
        description: string | null;
        title: string;
        courseId: string;
        uploadedById: string;
        isRequired: boolean;
        url: string | null;
        uploadDate: Date;
        fileId: string | null;
    }[]>;
}
