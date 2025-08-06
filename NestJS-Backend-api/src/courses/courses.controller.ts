import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Create a new course (supervisors only)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @AuditLog('CREATE_COURSE')
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.coursesService.createCourse(createCourseDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with filters' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async findAll(@Query() filters: any) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Get('instructor/:teacherId')
  @ApiOperation({ summary: 'Get courses by instructor' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getCoursesByInstructor(@Param('teacherId') teacherId: string) {
    return this.coursesService.getCoursesByInstructor(teacherId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get courses by student' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getCoursesByStudent(@Param('studentId') studentId: string) {
    return this.coursesService.getCoursesByStudent(studentId);
  }

  // ============= STUDY PLAN ENDPOINTS =============

  @Post(':courseId/study-plan')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Create study plan for a course' })
  @ApiResponse({ status: 201, description: 'Study plan created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - only course instructor or creator can create study plan' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @AuditLog('CREATE_STUDY_PLAN')
  async createStudyPlan(
    @Param('courseId') courseId: string,
    @Body() createStudyPlanDto: CreateStudyPlanDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.coursesService.createStudyPlan(courseId, createStudyPlanDto, user.id);
  }

  @Get(':courseId/study-plan')
  @ApiOperation({ summary: 'Get study plan for a course' })
  @ApiResponse({ status: 200, description: 'Study plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getStudyPlan(@Param('courseId') courseId: string) {
    return this.coursesService.getStudyPlan(courseId);
  }

  @Put(':courseId/study-plan')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Update study plan for a course' })
  @ApiResponse({ status: 200, description: 'Study plan updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - only course instructor or creator can update study plan' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @AuditLog('UPDATE_STUDY_PLAN')
  async updateStudyPlan(
    @Param('courseId') courseId: string,
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.coursesService.updateStudyPlan(courseId, updateStudyPlanDto, user.id);
  }

  @Delete(':courseId/study-plan')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Delete study plan for a course' })
  @ApiResponse({ status: 200, description: 'Study plan deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - only course instructor or creator can delete study plan' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @AuditLog('DELETE_STUDY_PLAN')
  async deleteStudyPlan(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.coursesService.deleteStudyPlan(courseId, user.id);
  }
}