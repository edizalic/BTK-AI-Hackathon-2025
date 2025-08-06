import { Assignment } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFiltersDto } from './dto/assignment-filters.dto';
export declare class AssignmentsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createAssignment(dto: CreateAssignmentDto, creatorId: string): Promise<Assignment>;
    findAll(filters?: AssignmentFiltersDto): Promise<Assignment[]>;
    findById(id: string): Promise<Assignment | null>;
    updateAssignment(id: string, dto: UpdateAssignmentDto, userId: string): Promise<Assignment>;
    getAssignmentsByStudent(studentId: string): Promise<Assignment[]>;
    getAssignmentsByCourse(courseId: string): Promise<Assignment[]>;
    deleteAssignment(id: string, userId: string): Promise<void>;
    checkOverdueAssignments(): Promise<void>;
}
