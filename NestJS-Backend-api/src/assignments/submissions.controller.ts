import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { UserRole } from '@prisma/client';
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER', 
  SUPERVISOR_TEACHER = 'SUPERVISOR_TEACHER',
  ADMIN = 'ADMIN'
}

import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@ApiTags('Assignment Submissions')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':assignmentId/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit assignment (students only)' })
  @ApiResponse({ status: 201, description: 'Assignment submitted successfully' })
  @AuditLog('SUBMIT_ASSIGNMENT')
  async submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() submitAssignmentDto: SubmitAssignmentDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.submissionsService.submitAssignment(
      assignmentId,
      user.id,
      submitAssignmentDto,
    );
  }

  @Get(':assignmentId/submissions')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get assignment submissions (teachers/supervisors)' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  async getAssignmentSubmissions(@Param('assignmentId') assignmentId: string) {
    return this.submissionsService.getAssignmentSubmissions(assignmentId);
  }

  @Get(':assignmentId/submission')
  @ApiOperation({ summary: 'Get current user submission for assignment' })
  @ApiResponse({ status: 200, description: 'Submission retrieved successfully' })
  async getMySubmission(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.submissionsService.getSubmission(assignmentId, user.id);
  }

  @Put(':assignmentId/submission')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Update assignment submission (students only)' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  @AuditLog('UPDATE_SUBMISSION')
  async updateSubmission(
    @Param('assignmentId') assignmentId: string,
    @Body() submitAssignmentDto: SubmitAssignmentDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.submissionsService.updateSubmission(
      assignmentId,
      user.id,
      submitAssignmentDto,
    );
  }

  @Get('student/:studentId/submissions')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get student submissions (teachers/supervisors)' })
  @ApiResponse({ status: 200, description: 'Student submissions retrieved successfully' })
  async getStudentSubmissions(@Param('studentId') studentId: string) {
    return this.submissionsService.getStudentSubmissions(studentId);
  }
}