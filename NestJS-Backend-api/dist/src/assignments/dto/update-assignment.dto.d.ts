import { AssignmentStatus } from '@prisma/client';
import { CreateAssignmentDto } from './create-assignment.dto';
declare const UpdateAssignmentDto_base: import("@nestjs/common").Type<Partial<CreateAssignmentDto>>;
export declare class UpdateAssignmentDto extends UpdateAssignmentDto_base {
    status?: AssignmentStatus;
}
export {};
