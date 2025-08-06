import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Course, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plan.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCourse(dto: CreateCourseDto, supervisorId: string): Promise<Course> {
    try {
      // Verify supervisor exists and has the right role
      const supervisor = await this.prisma.user.findUnique({
        where: { id: supervisorId },
        include: { profile: true },
      });

      if (!supervisor) {
        throw new NotFoundException('Supervisor not found');
      }

      if (supervisor.role !== UserRole.SUPERVISOR_TEACHER) {
        throw new BadRequestException('Only supervisor teachers can create courses');
      }

      // Verify instructor exists and is a teacher or supervisor
      const instructor = await this.prisma.user.findUnique({
        where: { id: dto.instructorId },
        include: { profile: true },
      });

      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }

      if (instructor.role !== UserRole.TEACHER && instructor.role !== UserRole.SUPERVISOR_TEACHER) {
        throw new BadRequestException('Instructor must be a teacher or supervisor teacher');
      }

      // Verify department exists - try by ID first, then by name
      let department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });

      // If not found by ID, try to find by name
      if (!department) {
        department = await this.prisma.department.findUnique({
          where: { name: dto.departmentId },
        });
      }

      if (!department) {
        throw new NotFoundException(`Department not found with ID or name: ${dto.departmentId}`);
      }

      // Check if course code already exists
      const existingCourse = await this.prisma.course.findUnique({
        where: { code: dto.code },
      });

      if (existingCourse) {
        throw new BadRequestException('Course code already exists');
      }

      // Create the course
      const course = await this.prisma.course.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          credits: dto.credits,
          scheduleDays: dto.scheduleDays,
          startTime: dto.startTime,
          endTime: dto.endTime,
          location: dto.location,
          building: dto.building,
          room: dto.room,
          createdById: supervisorId,
          instructorId: dto.instructorId,
          semester: dto.semester,
          year: dto.year,
          capacity: dto.capacity,
          category: dto.category,
          departmentId: department.id,
          level: dto.level,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          enrollmentDeadline: dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : null,
          studyPlan: dto.studyPlan ? JSON.parse(JSON.stringify(dto.studyPlan)) : null,
        },
        include: {
          instructor: {
            include: { profile: true },
          },
          department: true,
          createdBy: {
            include: { profile: true },
          },
        },
      });

      this.logger.log(`Course created: ${course.code} - ${course.name} by supervisor ${supervisor.email}`);

      return course;
    } catch (error) {
      this.logger.error('Error creating course:', error);
      throw error;
    }
  }

  async findAll(filters: any = {}): Promise<Course[]> {
    return this.prisma.course.findMany({
      include: {
        instructor: {
          include: { profile: true },
        },
        department: true,
        enrollments: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          include: { profile: true },
        },
        department: true,
        enrollments: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
        assignments: true,
        courseMaterials: true,
        quizzes: true,
        announcements: true,
      },
    });
  }

  async getCoursesByInstructor(teacherId: string): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: { instructorId: teacherId },
      include: {
        department: true,
        enrollments: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            studentId,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        instructor: {
          include: { profile: true },
        },
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // ============= STUDY PLAN CRUD OPERATIONS =============

  async createStudyPlan(courseId: string, dto: CreateStudyPlanDto, userId: string): Promise<Course> {
    try {
      // Verify course exists
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true, createdBy: true },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Check if user has permission to create/update study plan
      // Only the course instructor or creator (supervisor) can modify study plan
      if (course.instructorId !== userId && course.createdById !== userId) {
        throw new BadRequestException('You do not have permission to create study plan for this course');
      }

      // Update course with study plan
      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          studyPlan: JSON.parse(JSON.stringify(dto.weeks)),
        },
        include: {
          instructor: {
            include: { profile: true },
          },
          department: true,
          createdBy: {
            include: { profile: true },
          },
        },
      });

      this.logger.log(`Study plan created for course: ${course.code} by user ${userId}`);

      return updatedCourse;
    } catch (error) {
      this.logger.error('Error creating study plan:', error);
      throw error;
    }
  }

  async getStudyPlan(courseId: string): Promise<any> {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          code: true,
          name: true,
          studyPlan: true,
        },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      return {
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        studyPlan: course.studyPlan || [],
      };
    } catch (error) {
      this.logger.error('Error getting study plan:', error);
      throw error;
    }
  }

  async updateStudyPlan(courseId: string, dto: UpdateStudyPlanDto, userId: string): Promise<Course> {
    try {
      // Verify course exists
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true, createdBy: true },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Check if user has permission to update study plan
      if (course.instructorId !== userId && course.createdById !== userId) {
        throw new BadRequestException('You do not have permission to update study plan for this course');
      }

      // Update course with new study plan
      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          studyPlan: JSON.parse(JSON.stringify(dto.weeks)),
        },
        include: {
          instructor: {
            include: { profile: true },
          },
          department: true,
          createdBy: {
            include: { profile: true },
          },
        },
      });

      this.logger.log(`Study plan updated for course: ${course.code} by user ${userId}`);

      return updatedCourse;
    } catch (error) {
      this.logger.error('Error updating study plan:', error);
      throw error;
    }
  }

  async deleteStudyPlan(courseId: string, userId: string): Promise<Course> {
    try {
      // Verify course exists
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true, createdBy: true },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Check if user has permission to delete study plan
      if (course.instructorId !== userId && course.createdById !== userId) {
        throw new BadRequestException('You do not have permission to delete study plan for this course');
      }

      // Remove study plan from course
      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          studyPlan: null,
        },
        include: {
          instructor: {
            include: { profile: true },
          },
          department: true,
          createdBy: {
            include: { profile: true },
          },
        },
      });

      this.logger.log(`Study plan deleted for course: ${course.code} by user ${userId}`);

      return updatedCourse;
    } catch (error) {
      this.logger.error('Error deleting study plan:', error);
      throw error;
    }
  }
}