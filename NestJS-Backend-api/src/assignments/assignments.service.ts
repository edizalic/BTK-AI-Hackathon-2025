import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Assignment, AssignmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFiltersDto } from './dto/assignment-filters.dto';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createAssignment(dto: CreateAssignmentDto, creatorId: string): Promise<Assignment> {
    try {
      // Verify creator can manage the course
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
        include: { instructor: true, createdBy: true },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId },
      });

      if (!creator) {
        throw new NotFoundException('Creator not found');
      }

      // Check if creator can create assignments for this course
      const canCreate = creator.role === UserRole.SUPERVISOR_TEACHER || 
                       course.instructorId === creatorId ||
                       course.createdById === creatorId;

      if (!canCreate) {
        throw new ForbiddenException('You cannot create assignments for this course');
      }

      return await this.prisma.assignment.create({
        data: {
          courseId: dto.courseId,
          createdById: creatorId,
          title: dto.title,
          description: dto.description,
          type: dto.type,
          dueDate: dto.dueDate,
          maxPoints: dto.maxPoints,
          isGroupWork: dto.isGroupWork || false,
        },
        include: {
          course: true,
          createdBy: {
            include: { profile: true },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error creating assignment:', error);
      throw error;
    }
  }

  async findAll(filters: AssignmentFiltersDto = {}): Promise<Assignment[]> {
    const where: any = {};

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        course: {
          include: { department: true },
        },
        createdBy: {
          include: { profile: true },
        },
        submissions: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string): Promise<Assignment | null> {
    return this.prisma.assignment.findUnique({
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
        createdBy: {
          include: { profile: true },
        },
        submissions: {
          include: {
            student: {
              include: { profile: true },
            },
            files: true,
            grade: true,
          },
        },
        attachments: true,
      },
    });
  }

  async updateAssignment(id: string, dto: UpdateAssignmentDto, userId: string): Promise<Assignment> {
    const assignment = await this.findById(id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user can update this assignment
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canUpdate = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     assignment.createdById === userId;

    if (!canUpdate) {
      throw new ForbiddenException('You cannot update this assignment');
    }

    return this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        dueDate: dto.dueDate,
        maxPoints: dto.maxPoints,
        isGroupWork: dto.isGroupWork,
        status: dto.status,
      },
      include: {
        course: true,
        createdBy: {
          include: { profile: true },
        },
      },
    });
  }

  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              studentId,
              status: 'ACTIVE',
            },
          },
        },
      },
      include: {
        course: {
          include: {
            instructor: {
              include: { profile: true },
            },
          },
        },
        submissions: {
          where: { studentId },
          include: { grade: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        createdBy: {
          include: { profile: true },
        },
        submissions: {
          include: {
            student: {
              include: { profile: true },
            },
            grade: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAssignment(id: string, userId: string): Promise<void> {
    const assignment = await this.findById(id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user can delete this assignment
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canDelete = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     assignment.createdById === userId;

    if (!canDelete) {
      throw new ForbiddenException('You cannot delete this assignment');
    }

    await this.prisma.assignment.delete({
      where: { id },
    });
  }

  // Cron job to check for overdue assignments
  async checkOverdueAssignments(): Promise<void> {
    try {
      const now = new Date();
      await this.prisma.assignment.updateMany({
        where: {
          dueDate: { lt: now },
          status: { in: ['ASSIGNED', 'DRAFT'] },
        },
        data: {
          status: AssignmentStatus.OVERDUE,
        },
      });

      this.logger.log('Updated overdue assignments');
    } catch (error) {
      this.logger.error('Error checking overdue assignments:', error);
    }
  }
}