import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enrollStudent(courseId: string, studentId: string, supervisorId: string) {
    return this.prisma.enrollment.create({
      data: {
        courseId,
        studentId,
        enrolledById: supervisorId,
      },
    });
  }

  async getEnrollmentsByCourse(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: { profile: true },
        },
      },
    });
  }

  async getEnrollmentsByStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: {
              include: { profile: true },
            },
            department: true,
          },
        },
      },
    });
  }

  async bulkEnrollStudents(courseId: string, studentIds: string[], supervisorId: string) {
    try {
      // Validate that the course exists
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new BadRequestException('Course not found');
      }

      // Check for existing enrollments to avoid duplicates
      const existingEnrollments = await this.prisma.enrollment.findMany({
        where: {
          courseId,
          studentId: { in: studentIds },
        },
        select: { studentId: true },
      });

      const existingStudentIds = existingEnrollments.map(e => e.studentId);
      const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

      if (newStudentIds.length === 0) {
        throw new BadRequestException('All students are already enrolled in this course');
      }

      // Perform bulk enrollment in a transaction
      const enrollments = await this.prisma.$transaction(
        newStudentIds.map(studentId =>
          this.prisma.enrollment.create({
            data: {
              courseId,
              studentId,
              enrolledById: supervisorId,
            },
            include: {
              student: {
                include: { profile: true },
              },
            },
          })
        )
      );

      this.logger.log(`Bulk enrolled ${enrollments.length} students in course ${courseId}`);

      return {
        success: true,
        enrolled: enrollments,
        skipped: existingStudentIds,
        message: `Successfully enrolled ${enrollments.length} students. ${existingStudentIds.length} students were already enrolled.`,
      };
    } catch (error) {
      this.logger.error('Error during bulk enrollment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to enroll students');
    }
  }
}