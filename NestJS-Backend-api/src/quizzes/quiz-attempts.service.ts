import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { QuizAttempt, UserRole, EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startQuizAttempt(quizId: string, studentId: string): Promise<any> {
    try {
      // Verify quiz exists and is available
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { course: true },
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      // Check if student can access this quiz
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId: quiz.courseId,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      if (!enrollment) {
        throw new BadRequestException('You are not enrolled in this course');
      }

      // Check if quiz is still available
      if (quiz.dueDate && new Date() > quiz.dueDate) {
        throw new BadRequestException('Quiz deadline has passed');
      }

      // Check for existing unsubmitted attempt first
      const existingUnsubmittedAttempt = await this.prisma.quizAttempt.findFirst({
        where: {
          quizId,
          studentId,
          submittedAt: null,
        },
        orderBy: { startedAt: 'desc' },
      });

      if (existingUnsubmittedAttempt) {
        // Return the existing unsubmitted attempt with quiz questions
        const attempt = await this.prisma.quizAttempt.findUnique({
          where: { id: existingUnsubmittedAttempt.id },
          include: {
            quiz: {
              include: { course: true },
            },
            student: {
              include: { profile: true },
            },
          },
        });

              // Get sanitized quiz data with questions
      const sanitizedQuiz = await this.getQuizWithQuestionsForStudent(quizId, studentId);
      
      const result = {
        ...attempt,
        quiz: sanitizedQuiz
      };
      
      // Debug: Log what we're actually returning
      this.logger.debug(`Returning result with quiz questions count: ${result.quiz?.questions?.length || 0}`);
      this.logger.debug(`Sanitized quiz questions: ${JSON.stringify(result.quiz?.questions)}`);
      
      return result;
      }

      // Check total attempts count
      const totalAttempts = await this.prisma.quizAttempt.count({
        where: {
          quizId,
          studentId,
        },
      });

      if (totalAttempts >= quiz.attemptsAllowed) {
        throw new BadRequestException('Maximum attempts exceeded');
      }

      // Create new attempt
      const attempt = await this.prisma.quizAttempt.create({
        data: {
          quizId,
          studentId,
          startedAt: new Date(),
          score: 0,
          answers: {},
        },
        include: {
          quiz: {
            include: { course: true },
          },
          student: {
            include: { profile: true },
          },
        },
      });

      // Get sanitized quiz data with questions
      const sanitizedQuiz = await this.getQuizWithQuestionsForStudent(quizId, studentId);
      
      const result = {
        ...attempt,
        quiz: sanitizedQuiz
      };
      
      // Debug: Log what we're actually returning
      this.logger.debug(`Returning result with quiz questions count: ${result.quiz?.questions?.length || 0}`);
      this.logger.debug(`Sanitized quiz questions: ${JSON.stringify(result.quiz?.questions)}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  async submitQuizAttempt(
    attemptId: string,
    answers: Record<string, any>,
    studentId: string,
  ): Promise<any> {
    try {
      // Find the attempt
      const attempt = await this.prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: true,
          student: true,
        },
      });

      if (!attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      if (attempt.studentId !== studentId) {
        throw new BadRequestException('You can only submit your own quiz attempts');
      }

      if (attempt.submittedAt) {
        throw new BadRequestException('Quiz attempt already submitted');
      }

      // Check if time limit exceeded (if quiz is timed)
      if (attempt.quiz.isTimed && attempt.startedAt) {
        const durationInMs = this.parseDuration(attempt.quiz.duration);
        const timeElapsed = Date.now() - attempt.startedAt.getTime();
        
        if (timeElapsed > durationInMs) {
          throw new BadRequestException('Time limit exceeded');
        }
      }

      // Calculate score (basic implementation - could be more sophisticated)
      const score = this.calculateScore(answers, attempt.quiz);

      // Update attempt
      const updatedAttempt = await this.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          answers,
          score,
          submittedAt: new Date(),
        },
        include: {
          quiz: {
            include: { course: true },
          },
          student: {
            include: { profile: true },
          },
        },
      });

      // Create grade entry for the quiz attempt
      await this.createGradeFromQuizAttempt(updatedAttempt);

      return updatedAttempt;
    } catch (error) {
      this.logger.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  async getStudentAttempts(quizId: string, studentId: string): Promise<any[]> {
    return this.prisma.quizAttempt.findMany({
      where: {
        quizId,
        studentId,
      },
      include: {
        quiz: {
          include: { course: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getAttemptById(attemptId: string, userId: string): Promise<any> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: { 
            course: true,
            createdBy: true,
          },
        },
        student: {
          include: { profile: true },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // Check if user can access this attempt
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canAccess = attempt.studentId === userId || 
                     user.role === UserRole.SUPERVISOR_TEACHER ||
                     attempt.quiz.createdById === userId ||
                     attempt.quiz.course.instructorId === userId;

    if (!canAccess) {
      throw new BadRequestException('Access denied');
    }

    return attempt;
  }

  private parseDuration(duration: string): number {
    // Parse duration string like "60 minutes", "1 hour", etc.
    // Returns duration in milliseconds
    const match = duration.match(/(\d+)\s*(minute|hour|day)s?/i);
    if (!match) {
      return 60 * 60 * 1000; // Default 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'minute':
        return value * 60 * 1000;
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // Default 1 hour
    }
  }

  private calculateScore(answers: Record<string, any>, quiz: any): number {
    // Basic scoring implementation
    // In a real application, this would compare against correct answers stored in the quiz
    const totalQuestions = quiz.totalQuestions;
    const answeredQuestions = Object.keys(answers).length;
    
    // Simple calculation: assume each question is worth equal points
    return Math.round((answeredQuestions / totalQuestions) * quiz.maxPoints);
  }

  private async getQuizWithQuestionsForStudent(quizId: string, studentId: string): Promise<any> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if student is enrolled
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId: quiz.courseId,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You are not enrolled in this course');
    }

    // Access questionsData from the quiz object (using type assertion since Prisma types don't include Json fields properly)
    const questionsData = (quiz as any).questionsData as any;
    this.logger.debug(`Quiz questionsData: ${JSON.stringify(questionsData)}`);
    
    const sanitizedQuestions = questionsData?.questions ? questionsData.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      points: q.points
      // Deliberately exclude correctAnswer and explanation
    })) : [];

    this.logger.debug(`Sanitized questions count: ${sanitizedQuestions.length}`);
    this.logger.debug(`Sanitized questions: ${JSON.stringify(sanitizedQuestions)}`);

    const result = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      totalQuestions: quiz.totalQuestions,
      maxPoints: quiz.maxPoints,
      dueDate: quiz.dueDate,
      isTimed: quiz.isTimed,
      attemptsAllowed: quiz.attemptsAllowed,
      questions: sanitizedQuestions,
      course: quiz.course
    };
    
    this.logger.debug(`Returning sanitized quiz with questions count: ${result.questions.length}`);
    
    return result;
  }

  /**
   * Creates a grade entry from a quiz attempt
   */
  private async createGradeFromQuizAttempt(attempt: any): Promise<void> {
    try {
      // Check if grade already exists for this quiz attempt
      // We'll use a combination of studentId, courseId, and quiz title to identify quiz grades
      const existingGrade = await this.prisma.grade.findFirst({
        where: {
          studentId: attempt.studentId,
          courseId: attempt.quiz.courseId,
          feedback: {
            contains: `Quiz: ${attempt.quiz.title}`
          }
        },
      });

      if (existingGrade) {
        this.logger.debug('Grade already exists for this quiz attempt');
        return;
      }

      // Calculate letter grade based on percentage
      const percentage = (attempt.score / attempt.quiz.maxPoints) * 100;
      const letterGrade = this.calculateLetterGrade(percentage);

      // Create grade entry
      await this.prisma.grade.create({
        data: {
          studentId: attempt.studentId,
          courseId: attempt.quiz.courseId,
          // assignmentId and submissionId remain null for quiz grades
          letterGrade,
          score: attempt.score,
          maxPoints: attempt.quiz.maxPoints,
          percentage,
          gradedById: attempt.quiz.createdById, // Quiz creator grades it
          feedback: `Quiz: ${attempt.quiz.title}`,
          isExtraCredit: false,
          weight: 1.0, // Default weight for quizzes
        },
      });

      this.logger.log(`Created grade entry for quiz attempt ${attempt.id}`);
    } catch (error) {
      this.logger.error('Error creating grade from quiz attempt:', error);
      // Don't throw error to avoid breaking quiz submission
    }
  }

  /**
   * Calculate letter grade based on percentage
   */
  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }
}