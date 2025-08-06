import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { GradesService } from './grades.service';
import { GradeCalculationService } from './grade-calculation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeFiltersDto } from './dto/grade-filters.dto';

@ApiTags('Grades')
@Controller('grades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly gradeCalculationService: GradeCalculationService,
  ) {}

  @Post('submissions/:submissionId')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Grade assignment submission (teachers/supervisors)' })
  @ApiResponse({ status: 201, description: 'Grade created successfully' })
  @AuditLog('GRADE_ASSIGNMENT')
  async gradeAssignment(
    @Param('submissionId') submissionId: string,
    @Body() createGradeDto: CreateGradeDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.gradesService.gradeAssignment(submissionId, createGradeDto, user.id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student grades' })
  @ApiResponse({ status: 200, description: 'Student grades retrieved successfully' })
  async getStudentGrades(
    @Param('studentId') studentId: string,
    @Query() filters: GradeFiltersDto,
  ) {
    return this.gradesService.getGradesByStudent(studentId, filters);
  }

  @Get('course/:courseId')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get course grades (teachers/supervisors)' })
  @ApiResponse({ status: 200, description: 'Course grades retrieved successfully' })
  async getCourseGrades(@Param('courseId') courseId: string) {
    return this.gradesService.getGradesByCourse(courseId);
  }

  @Put(':gradeId')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Update grade' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  @AuditLog('UPDATE_GRADE')
  async updateGrade(
    @Param('gradeId') gradeId: string,
    @Body() updateGradeDto: UpdateGradeDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.gradesService.updateGrade(gradeId, updateGradeDto, user.id);
  }

  @Get('student/:studentId/gpa')
  @ApiOperation({ summary: 'Calculate student GPA' })
  @ApiResponse({ status: 200, description: 'GPA calculated successfully' })
  async calculateStudentGPA(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year) : undefined;
    const gpa = await this.gradeCalculationService.calculateGPA(studentId, semester, yearNum);
    
    return {
      studentId,
      gpa,
      semester,
      year: yearNum,
      calculatedAt: new Date().toISOString(),
    };
  }

  @Get('student/:studentId/report')
  @ApiOperation({ summary: 'Generate student grade report' })
  @ApiResponse({ status: 200, description: 'Grade report generated successfully' })
  async generateGradeReport(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year) : undefined;
    return this.gradesService.generateGradeReport(studentId, semester, yearNum);
  }

  @Get('student/:studentId/transcript')
  @ApiOperation({ summary: 'Get student transcript' })
  @ApiResponse({ status: 200, description: 'Transcript retrieved successfully' })
  async getStudentTranscript(@Param('studentId') studentId: string) {
    return this.gradeCalculationService.getStudentTranscript(studentId);
  }

  @Get('course/:courseId/statistics')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Get course grade statistics (teachers/supervisors)' })
  @ApiResponse({ status: 200, description: 'Course statistics retrieved successfully' })
  async getCourseStatistics(@Param('courseId') courseId: string) {
    return this.gradeCalculationService.calculateCourseGrades(courseId);
  }
}