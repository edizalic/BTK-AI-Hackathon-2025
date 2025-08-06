import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { QuizzesService } from './quizzes.service';
import { QuizAttemptsService } from './quiz-attempts.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

@ApiTags('Quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizAttemptsService: QuizAttemptsService,
  ) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @AuditLog('CREATE_QUIZ')
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizzesService.createQuiz(createQuizDto, user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all quizzes for a course' })
  @ApiResponse({ status: 200, description: 'Quizzes retrieved successfully' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(@Param('id') id: string) {
    return this.quizzesService.getQuizById(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @AuditLog('UPDATE_QUIZ')
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizzesService.updateQuiz(id, updateQuizDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @AuditLog('DELETE_QUIZ')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizzesService.deleteQuiz(id, user.id);
  }

  @Get(':id/attempts')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get quiz attempts' })
  @ApiResponse({ status: 200, description: 'Quiz attempts retrieved successfully' })
  async getAttempts(
    @Param('id') quizId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.quizzesService.getQuizAttempts(quizId, studentId);
  }

  @Get(':id/student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get quiz for student (without correct answers)' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully for student' })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  async getQuizForStudent(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizzesService.getQuizForStudent(id, user.id);
  }

  @Get(':id/teacher')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get quiz for teacher (with correct answers)' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully for teacher' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getQuizForTeacher(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizzesService.getQuizForTeacher(id, user.id);
  }

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz submitted and graded successfully' })
  @ApiResponse({ status: 403, description: 'Not eligible to take quiz' })
  @AuditLog('SUBMIT_QUIZ')
  async submitQuiz(
    @Param('id') quizId: string,
    @Body() submitDto: SubmitQuizDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    // Start attempt if not exists, then grade
    const attempt = await this.quizAttemptsService.startQuizAttempt(quizId, user.id);
    return this.quizzesService.gradeQuizAttempt(attempt.id, submitDto.answers);
  }

  @Get('student/:studentId/wrong-answers')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get student wrong answers from all quizzes' })
  @ApiResponse({ status: 200, description: 'Wrong answers retrieved successfully' })
  async getStudentWrongAnswers(
    @Param('studentId') studentId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    // Students can only access their own wrong answers
    if (user.role === UserRole.STUDENT && user.id !== studentId) {
      throw new BadRequestException('You can only access your own wrong answers');
    }
    
    return this.quizzesService.getStudentWrongAnswers(studentId);
  }

  @Get('student/:studentId/attempts')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get all quiz attempts for a specific student' })
  @ApiResponse({ status: 200, description: 'Student quiz attempts retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'User is not a student' })
  async getStudentAllAttempts(@Param('studentId') studentId: string) {
    return this.quizzesService.getStudentAllQuizAttempts(studentId);
  }
}