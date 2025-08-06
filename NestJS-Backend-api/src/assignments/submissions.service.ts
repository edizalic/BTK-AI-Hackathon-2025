import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { AssignmentSubmission, AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submissionDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    try {
      // Check if assignment exists and is still open
      const assignment = await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          course: {
            include: {
              enrollments: {
                where: { studentId, status: 'ACTIVE' },
              },
            },
          },
        },
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      // Check if student is enrolled in the course
      if (assignment.course.enrollments.length === 0) {
        throw new BadRequestException('You are not enrolled in this course');
      }

      // Check if assignment is still open
      if (assignment.dueDate < new Date() && assignment.status !== AssignmentStatus.ASSIGNED) {
        throw new BadRequestException('Assignment submission deadline has passed');
      }

      // Check if student has already submitted
      const existingSubmission = await this.prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId,
          },
        },
      });

      if (existingSubmission) {
        throw new BadRequestException('You have already submitted this assignment');
      }

      // Create submission
      const submission = await this.prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId,
          textContent: submissionDto.textContent,
        },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
          student: {
            include: { profile: true },
          },
        },
      });

      // Link files if provided
      if (submissionDto.fileIds && submissionDto.fileIds.length > 0) {
        await this.prisma.fileAttachment.updateMany({
          where: {
            id: { in: submissionDto.fileIds },
            uploadedById: studentId,
          },
          data: {
            // This would need to be handled differently in the schema
            // For now, we'll create the relationship through submissionFiles
          },
        });
      }

      // Update assignment status if needed
      await this.prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: AssignmentStatus.SUBMITTED,
        },
      });

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: studentId,
          action: 'submit_assignment',
          details: {
            assignmentId,
            submissionId: submission.id,
          },
        },
      });

      return submission;
    } catch (error) {
      this.logger.error('Error submitting assignment:', error);
      throw error;
    }
  }

  async getSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    return this.prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
        student: {
          include: { profile: true },
        },
        files: true,
        grade: true,
      },
    });
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          include: { profile: true },
        },
        files: true,
        grade: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async getStudentSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
    return this.prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: {
            course: {
              include: {
                instructor: {
                  include: { profile: true },
                },
              },
            },
          },
        },
        files: true,
        grade: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async updateSubmission(
    assignmentId: string,
    studentId: string,
    submissionDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    const submission = await this.getSubmission(assignmentId, studentId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if assignment is still open for updates
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (assignment && assignment.dueDate < new Date()) {
      throw new BadRequestException('Cannot update submission after deadline');
    }

    return this.prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      data: {
        textContent: submissionDto.textContent,
        submittedAt: new Date(), // Update submission time
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
        student: {
          include: { profile: true },
        },
        files: true,
        grade: true,
      },
    });
  }
}