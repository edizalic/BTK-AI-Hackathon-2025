import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Quiz, QuizAttempt, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(dto: CreateQuizDto, creatorId: string): Promise<Quiz> {
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

      // Check if creator can create quizzes for this course
      const canCreate = creator.role === UserRole.SUPERVISOR_TEACHER || 
                       course.instructorId === creatorId ||
                       course.createdById === creatorId;

      if (!canCreate) {
        throw new BadRequestException('You cannot create quizzes for this course');
      }

      // Calculate total questions and max points from questions array
      const totalQuestions = dto.questions.length;
      const maxPoints = dto.questions.reduce((sum, q) => sum + q.points, 0);

      return await this.prisma.quiz.create({
        data: {
          courseId: dto.courseId,
          createdById: creatorId,
          title: dto.title,
          description: dto.description,
          duration: dto.duration,
          totalQuestions,
          maxPoints,
          dueDate: dto.dueDate,
          isTimed: dto.isTimed || false,
          attemptsAllowed: dto.attemptsAllowed || 1,
          // Store complete questions data with correct answers
          questionsData: {
            questions: dto.questions
          } as any,
        },
        include: {
          course: {
            include: { department: true },
          },
          createdBy: {
            include: { profile: true },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error creating quiz:', error);
      throw error;
    }
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        createdBy: {
          include: { profile: true },
        },
        attempts: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    return this.prisma.quiz.findUnique({
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
        attempts: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
      },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto, userId: string): Promise<Quiz> {
    const quiz = await this.getQuizById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if user can update this quiz
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canUpdate = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     quiz.createdById === userId;

    if (!canUpdate) {
      throw new BadRequestException('You cannot update this quiz');
    }

    // Calculate totalQuestions and maxPoints if questions are provided
    const updateData: any = {
      title: dto.title,
      description: dto.description,
      duration: dto.duration,
      dueDate: dto.dueDate,
      isTimed: dto.isTimed,
      attemptsAllowed: dto.attemptsAllowed,
    };

    if (dto.questions && dto.questions.length > 0) {
      updateData.totalQuestions = dto.questions.length;
      updateData.maxPoints = dto.questions.reduce((sum, q) => sum + q.points, 0);
      updateData.questionsData = {
        questions: dto.questions
      } as any;
    }

    return this.prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          include: { department: true },
        },
        createdBy: {
          include: { profile: true },
        },
      },
    });
  }

  async deleteQuiz(id: string, userId: string): Promise<void> {
    const quiz = await this.getQuizById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if user can delete this quiz
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const canDelete = user?.role === UserRole.SUPERVISOR_TEACHER || 
                     quiz.createdById === userId;

    if (!canDelete) {
      throw new BadRequestException('You cannot delete this quiz');
    }

    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  async getQuizzesByStudent(studentId: string): Promise<Quiz[]> {
    return this.prisma.quiz.findMany({
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
        attempts: {
          where: { studentId },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async canStudentTakeQuiz(quizId: string, studentId: string): Promise<{
    canTake: boolean;
    reason?: string;
    attemptsLeft?: number;
  }> {
    try {
      const quiz = await this.getQuizById(quizId);
      if (!quiz) {
        return { canTake: false, reason: 'Quiz not found' };
      }

      // Check if student is enrolled in the course
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          courseId: quiz.courseId,
          studentId,
          status: 'ACTIVE',
        },
      });

      if (!enrollment) {
        return { canTake: false, reason: 'Not enrolled in this course' };
      }

      // Check if quiz is still open
      if (quiz.dueDate < new Date()) {
        return { canTake: false, reason: 'Quiz deadline has passed' };
      }

      // Check attempts limit
      const attemptCount = await this.prisma.quizAttempt.count({
        where: {
          quizId,
          studentId,
        },
      });

      const attemptsLeft = quiz.attemptsAllowed - attemptCount;

      if (attemptsLeft <= 0) {
        return { 
          canTake: false, 
          reason: 'Maximum attempts reached',
          attemptsLeft: 0,
        };
      }

      return { 
        canTake: true,
        attemptsLeft,
      };
    } catch (error) {
      this.logger.error('Error checking quiz eligibility:', error);
      return { canTake: false, reason: 'Error checking eligibility' };
    }
  }

  async getQuizStatistics(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
    scoreDistribution: Array<{ range: string; count: number }>;
  }> {
    try {
      const attempts = await this.prisma.quizAttempt.findMany({
        where: { 
          quizId,
          submittedAt: { not: null },
        },
      });

      if (attempts.length === 0) {
        return {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          completionRate: 0,
          scoreDistribution: [],
        };
      }

      const scores = attempts
        .filter(attempt => attempt.score !== null)
        .map(attempt => attempt.score as number);

      const totalAttempts = attempts.length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);

      // Calculate completion rate (submitted vs started)
      const totalStarted = await this.prisma.quizAttempt.count({
        where: { quizId },
      });
      const completionRate = totalStarted > 0 ? (totalAttempts / totalStarted) * 100 : 0;

      // Score distribution
      const scoreRanges = [
        { range: '0-20%', min: 0, max: 20 },
        { range: '21-40%', min: 21, max: 40 },
        { range: '41-60%', min: 41, max: 60 },
        { range: '61-80%', min: 61, max: 80 },
        { range: '81-100%', min: 81, max: 100 },
      ];

      const scoreDistribution = scoreRanges.map(range => ({
        range: range.range,
        count: scores.filter(score => {
          const percentage = (score / (attempts.find(a => a.score === score)?.maxPoints || 100)) * 100;
          return percentage >= range.min && percentage <= range.max;
        }).length,
      }));

      return {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        completionRate: Math.round(completionRate * 100) / 100,
        scoreDistribution,
      };
    } catch (error) {
      this.logger.error(`Error calculating quiz statistics for ${quizId}:`, error);
      throw error;
    }
  }

  async getQuizAttempts(quizId: string, studentId?: string): Promise<any[]> {
    try {
      const where: any = { quizId };
      
      if (studentId) {
        where.studentId = studentId;
      }

      return this.prisma.quizAttempt.findMany({
        where,
        include: {
          student: {
            include: { profile: true },
          },
          quiz: {
            select: {
              title: true,
              maxPoints: true,
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching quiz attempts for ${quizId}:`, error);
      throw error;
    }
  }

  // Get quiz for students (without correct answers)
  async getQuizForStudent(id: string, studentId: string): Promise<any> {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
        include: {
          course: {
            include: {
              enrollments: {
                where: { studentId, status: 'ACTIVE' }
              }
            }
          }
        }
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      // Debug enrollment check
      this.logger.debug(`Course enrollments: ${JSON.stringify(quiz.course.enrollments)}`);
      this.logger.debug(`Student ID: ${studentId}`);
      this.logger.debug(`Enrollment count: ${quiz.course.enrollments.length}`);

      // Check if student is enrolled
      if (quiz.course.enrollments.length === 0) {
        this.logger.debug('No enrollments found for student');
        throw new BadRequestException('You are not enrolled in this course');
      }

      // Debug logging
      this.logger.debug(`Quiz questionsData: ${JSON.stringify(quiz.questionsData)}`);
      this.logger.debug(`Quiz questionsData type: ${typeof quiz.questionsData}`);

      // Return quiz without correct answers
      const questionsData = quiz.questionsData as any;
      this.logger.debug(`Parsed questionsData: ${JSON.stringify(questionsData)}`);
      
      const sanitizedQuestions = questionsData?.questions ? questionsData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        points: q.points
        // Deliberately exclude correctAnswer and explanation
      })) : [];

      this.logger.debug(`Sanitized questions count: ${sanitizedQuestions.length}`);
      this.logger.debug(`Sanitized questions: ${JSON.stringify(sanitizedQuestions)}`);

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        maxPoints: quiz.maxPoints,
        dueDate: quiz.dueDate,
        isTimed: quiz.isTimed,
        attemptsAllowed: quiz.attemptsAllowed,
        questions: sanitizedQuestions
      };
    } catch (error) {
      this.logger.error('Error getting quiz for student:', error);
      throw error;
    }
  }

  // Get quiz for teachers/supervisors (with correct answers)
  async getQuizForTeacher(id: string, userId: string): Promise<Quiz> {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
        include: {
          course: true,
          createdBy: { include: { profile: true } }
        }
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      const canView = user?.role === UserRole.SUPERVISOR_TEACHER ||
                     quiz.createdById === userId ||
                     quiz.course.instructorId === userId;

      if (!canView) {
        throw new BadRequestException('Access denied');
      }

      return quiz;
    } catch (error) {
      this.logger.error('Error getting quiz for teacher:', error);
      throw error;
    }
  }

  // Grade quiz attempt (server-side only)
  async gradeQuizAttempt(
    attemptId: string,
    studentAnswers: Record<string, number>
  ): Promise<{ score: number; maxPoints: number; results: any[] }> {
    try {
      const attempt = await this.prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: { quiz: true }
      });

      if (!attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      const questionsData = attempt.quiz.questionsData as any;
      const questions = questionsData.questions;
      
      let totalScore = 0;
      const results = [];

      for (const question of questions) {
        const studentAnswer = studentAnswers[question.id];
        const isCorrect = studentAnswer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;
        
        totalScore += pointsEarned;
        
        results.push({
          questionId: question.id,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          pointsEarned,
          maxPoints: question.points,
          explanation: question.explanation
        });
      }

      // Update the attempt with the score
      const updatedAttempt = await this.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score: totalScore,
          maxPoints: attempt.quiz.maxPoints,
          submittedAt: new Date(),
          answers: {
            studentAnswers,
            results
          }
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

      return {
        score: totalScore,
        maxPoints: attempt.quiz.maxPoints,
        results
      };
    } catch (error) {
      this.logger.error('Error grading quiz attempt:', error);
      throw error;
    }
  }

  async getStudentWrongAnswers(studentId: string): Promise<any[]> {
    try {
      // Get all quiz attempts for the student
      const attempts = await this.prisma.quizAttempt.findMany({
        where: {
          studentId,
          submittedAt: { not: null }, // Only completed attempts
        },
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      const filteredResults = [];

      for (const attempt of attempts) {
        const answers = attempt.answers as any;
        const questionsData = attempt.quiz.questionsData as any;
        
        if (!answers?.results || !questionsData?.questions) {
          continue;
        }

        // Filter only wrong answers
        const wrongAnswers = answers.results
          .filter((result: any) => !result.isCorrect)
          .map((result: any) => {
            const question = questionsData.questions.find((q: any) => q.id === result.questionId);
            return {
              questionId: result.questionId,
              question: question?.question || 'Question not found',
              studentAnswer: result.studentAnswer,
              correctAnswer: result.correctAnswer,
              explanation: result.explanation,
            };
          });

        if (wrongAnswers.length > 0) {
          filteredResults.push({
            quizTitle: attempt.quiz.title,
            quizDescription: attempt.quiz.description,
            courseName: attempt.quiz.course.name,
            submittedAt: attempt.submittedAt,
            score: attempt.score,
            maxPoints: attempt.maxPoints,
            wrongAnsweredQuestions: wrongAnswers,
          });
        }
      }

      return filteredResults;
    } catch (error) {
      this.logger.error('Error getting student wrong answers:', error);
      throw error;
    }
  }

  async getStudentAllQuizAttempts(studentId: string): Promise<any[]> {
    return this.prisma.quizAttempt.findMany({
      where: {
        studentId,
        submittedAt: { not: null }, // Only completed attempts
      },
      include: {
        quiz: {
          include: {
            course: true,
            createdBy: {
              include: { profile: true },
            },
          },
        },
        student: {
          include: { profile: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Creates a grade entry from a quiz attempt
   */
  private async createGradeFromQuizAttempt(attempt: any): Promise<void> {
    try {
      this.logger.log(`Attempting to create grade for quiz attempt ${attempt.id}`);
      this.logger.log(`Student ID: ${attempt.studentId}`);
      this.logger.log(`Course ID: ${attempt.quiz.courseId}`);
      this.logger.log(`Quiz Title: ${attempt.quiz.title}`);
      this.logger.log(`Score: ${attempt.score}`);
      this.logger.log(`Max Points: ${attempt.quiz.maxPoints}`);

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

      this.logger.log(`Calculated percentage: ${percentage}%`);
      this.logger.log(`Calculated letter grade: ${letterGrade}`);

      // Create grade entry
      const gradeData = {
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
      };

      this.logger.log(`Creating grade with data: ${JSON.stringify(gradeData)}`);

      const createdGrade = await this.prisma.grade.create({
        data: gradeData,
      });

      this.logger.log(`Successfully created grade entry ${createdGrade.id} for quiz attempt ${attempt.id}`);
    } catch (error) {
      this.logger.error('Error creating grade from quiz attempt:', error);
      this.logger.error('Error details:', error.message);
      this.logger.error('Error stack:', error.stack);
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