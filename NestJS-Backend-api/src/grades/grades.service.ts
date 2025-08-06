import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Grade, UserRole, AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeFiltersDto } from './dto/grade-filters.dto';
import { GradeCalculationService } from './grade-calculation.service';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gradeCalculationService: GradeCalculationService,
  ) {}

  async gradeAssignment(
    submissionId: string,
    gradeDto: CreateGradeDto,
    graderId: string,
  ): Promise<Grade> {
    try {
      // Get submission details
      const submission = await this.prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
          student: true,
          grade: true,
        },
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      if (submission.grade) {
        throw new ForbiddenException('This submission has already been graded');
      }

      // Verify grader can grade this assignment
      const grader = await this.prisma.user.findUnique({
        where: { id: graderId },
      });

      if (!grader) {
        throw new NotFoundException('Grader not found');
      }

      const canGrade = grader.role === UserRole.SUPERVISOR_TEACHER || 
                      submission.assignment.course.instructorId === graderId;

      if (!canGrade) {
        throw new ForbiddenException('You cannot grade this assignment');
      }

      // Calculate percentage
      const percentage = (gradeDto.score / gradeDto.maxPoints) * 100;

      // Create grade
      const grade = await this.prisma.grade.create({
        data: {
          studentId: submission.studentId,
          courseId: submission.assignment.courseId,
          assignmentId: submission.assignment.id,
          submissionId: submissionId,
          letterGrade: gradeDto.letterGrade,
          score: gradeDto.score,
          maxPoints: gradeDto.maxPoints,
          percentage,
          gradedById: graderId,
          feedback: gradeDto.feedback,
          isExtraCredit: gradeDto.isExtraCredit || false,
          weight: gradeDto.weight,
        },
        include: {
          student: {
            include: { profile: true },
          },
          assignment: {
            include: { course: true },
          },
          gradedBy: {
            include: { profile: true },
          },
        },
      });

      // Update assignment status
      await this.prisma.assignment.update({
        where: { id: submission.assignment.id },
        data: { status: AssignmentStatus.GRADED },
      });

      // Update student's GPA
      await this.gradeCalculationService.updateStudentGPA(submission.studentId);

      // Log activity
      await this.prisma.userActivity.create({
        data: {
          userId: graderId,
          action: 'grade_assignment',
          details: {
            gradeId: grade.id,
            studentId: submission.studentId,
            assignmentId: submission.assignment.id,
            score: gradeDto.score,
            maxPoints: gradeDto.maxPoints,
          },
        },
      });

      return grade;
    } catch (error) {
      this.logger.error('Error grading assignment:', error);
      throw error;
    }
  }

  async updateGrade(gradeId: string, dto: UpdateGradeDto, graderId: string): Promise<Grade> {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        assignment: {
          include: { course: true },
        },
        student: true,
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    // Verify grader can update this grade
    const grader = await this.prisma.user.findUnique({
      where: { id: graderId },
    });

    const canUpdate = grader?.role === UserRole.SUPERVISOR_TEACHER || 
                     grade.gradedById === graderId ||
                     (grade.assignment?.course.instructorId === graderId);

    if (!canUpdate) {
      throw new ForbiddenException('You cannot update this grade');
    }

    // Calculate new percentage if score or maxPoints changed
    let percentage = grade.percentage;
    if (dto.score !== undefined || dto.maxPoints !== undefined) {
      const newScore = dto.score ?? grade.score;
      const newMaxPoints = dto.maxPoints ?? grade.maxPoints;
      percentage = (newScore / newMaxPoints) * 100;
    }

    const updatedGrade = await this.prisma.grade.update({
      where: { id: gradeId },
      data: {
        letterGrade: dto.letterGrade,
        score: dto.score,
        maxPoints: dto.maxPoints,
        percentage,
        feedback: dto.feedback,
        isExtraCredit: dto.isExtraCredit,
        weight: dto.weight,
      },
      include: {
        student: {
          include: { profile: true },
        },
        assignment: {
          include: { course: true },
        },
        gradedBy: {
          include: { profile: true },
        },
      },
    });

    // Update student's GPA
    await this.gradeCalculationService.updateStudentGPA(grade.studentId);

    return updatedGrade;
  }

  async getGradesByStudent(studentId: string, filters: GradeFiltersDto = {}): Promise<any[]> {
    const where: any = { studentId };

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters.semester) {
      // This would need to be implemented based on how you store semester info
    }

    if (filters.year) {
      // This would need to be implemented based on how you store year info
    }

    const grades = await this.prisma.grade.findMany({
      where,
      include: {
        course: {
          include: { department: true },
        },
        assignment: true,
        gradedBy: {
          include: { profile: true },
        },
      },
      orderBy: {
        gradedDate: 'desc',
      },
    });

    // Add type information to distinguish between quiz and assignment grades
    return grades.map(grade => ({
      ...grade,
      gradeType: grade.assignmentId ? 'assignment' : 'quiz',
      title: grade.assignment?.title || grade.feedback?.replace('Quiz: ', '') || 'Unknown',
    }));
  }

  async getGradesByCourse(courseId: string): Promise<Grade[]> {
    return this.prisma.grade.findMany({
      where: { courseId },
      include: {
        student: {
          include: { profile: true },
        },
        assignment: true,
        gradedBy: {
          include: { profile: true },
        },
      },
      orderBy: [
        { student: { profile: { lastName: 'asc' } } },
        { gradedDate: 'desc' },
      ],
    });
  }

  async generateGradeReport(
    studentId: string,
    semester?: string,
    year?: number,
  ): Promise<any> {
    const filters: any = { studentId };
    
    // Add semester/year filtering logic here based on your course model
    
    const grades = await this.getGradesByStudent(studentId, filters);
    const gpa = await this.gradeCalculationService.calculateGPA(studentId, semester, year);
    
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { profile: true },
    });

    return {
      student: {
        id: student?.id,
        name: `${student?.profile?.firstName} ${student?.profile?.lastName}`,
        studentId: student?.profile?.studentId,
      },
      period: {
        semester,
        year,
      },
      grades: grades.map(grade => ({
        course: grade.course?.name,
        assignment: grade.assignment?.title,
        score: grade.score,
        maxPoints: grade.maxPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        gradedDate: grade.gradedDate,
      })),
      gpa,
      generatedAt: new Date().toISOString(),
    };
  }
}