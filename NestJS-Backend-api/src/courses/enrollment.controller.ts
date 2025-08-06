import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { BulkEnrollStudentsDto } from './dto/bulk-enroll-students.dto';

@ApiTags('Enrollment')
@Controller('enrollment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('courses/:courseId/students/:studentId')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Enroll student in course (supervisors only)' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @AuditLog('ENROLL_STUDENT')
  async enrollStudent(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.enrollmentService.enrollStudent(courseId, studentId, user.id);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get course enrollments' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getCourseEnrollments(@Param('courseId') courseId: string) {
    return this.enrollmentService.getEnrollmentsByCourse(courseId);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get student enrollments' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getStudentEnrollments(@Param('studentId') studentId: string) {
    return this.enrollmentService.getEnrollmentsByStudent(studentId);
  }

  @Post('courses/:courseId/bulk-enroll')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Bulk enroll students in course (supervisors only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Students enrolled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        enrolled: { 
          type: 'array',
          items: { type: 'object' }
        },
        skipped: {
          type: 'array',
          items: { type: 'string' }
        },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid student IDs or course not found' })
  @AuditLog('BULK_ENROLL_STUDENTS')
  async bulkEnrollStudents(
    @Param('courseId') courseId: string,
    @Body() dto: BulkEnrollStudentsDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.enrollmentService.bulkEnrollStudents(courseId, dto.studentIds, user.id);
  }
}