import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { QuizAttemptsService } from './quiz-attempts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

class SubmitQuizAnswersDto {
  answers: Record<string, any>;
}

@ApiTags('Quiz Attempts')
@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post('start/:quizId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Start a quiz attempt' })
  @ApiResponse({ status: 201, description: 'Quiz attempt started successfully' })
  @ApiResponse({ status: 400, description: 'Cannot start quiz attempt' })
  @AuditLog('START_QUIZ_ATTEMPT')
  async startAttempt(
    @Param('quizId') quizId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizAttemptsService.startQuizAttempt(quizId, user.id);
  }

  @Post(':attemptId/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz attempt submitted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot submit quiz attempt' })
  @AuditLog('SUBMIT_QUIZ_ATTEMPT')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitDto: SubmitQuizAnswersDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizAttemptsService.submitQuizAttempt(
      attemptId,
      submitDto.answers,
      user.id,
    );
  }

  @Get('quiz/:quizId/my-attempts')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get my quiz attempts' })
  @ApiResponse({ status: 200, description: 'Quiz attempts retrieved successfully' })
  async getMyAttempts(
    @Param('quizId') quizId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizAttemptsService.getStudentAttempts(quizId, user.id);
  }

  @Get(':attemptId')
  @ApiOperation({ summary: 'Get quiz attempt by ID' })
  @ApiResponse({ status: 200, description: 'Quiz attempt retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  async getAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.quizAttemptsService.getAttemptById(attemptId, user.id);
  }
}