import { MaterialType } from '@prisma/client';
export declare class CreateMaterialDto {
    title: string;
    description?: string;
    type: MaterialType;
    isRequired?: boolean;
    url?: string;
}
