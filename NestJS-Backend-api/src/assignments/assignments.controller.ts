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
// import { UserRole } from '@prisma/client';
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER', 
  SUPERVISOR_TEACHER = 'SUPERVISOR_TEACHER',
  ADMIN = 'ADMIN'
}

import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFiltersDto } from './dto/assignment-filters.dto';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Create assignment (teachers/supervisors)' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @AuditLog('CREATE_ASSIGNMENT')
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.assignmentsService.createAssignment(createAssignmentDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments with filters' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async findAll(@Query() filters: AssignmentFiltersDto) {
    return this.assignmentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async findOne(@Param('id') id: string) {
    return this.assignmentsService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Update assignment' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  @AuditLog('UPDATE_ASSIGNMENT')
  async updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.assignmentsService.updateAssignment(id, updateAssignmentDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Delete assignment' })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @AuditLog('DELETE_ASSIGNMENT')
  async deleteAssignment(
    @Param('id') id: string,
    @CurrentUser() user: UserWithProfile,
  ) {
    await this.assignmentsService.deleteAssignment(id, user.id);
    return { message: 'Assignment deleted successfully' };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get assignments for a student' })
  @ApiResponse({ status: 200, description: 'Student assignments retrieved successfully' })
  async getAssignmentsByStudent(@Param('studentId') studentId: string) {
    return this.assignmentsService.getAssignmentsByStudent(studentId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get assignments for a course' })
  @ApiResponse({ status: 200, description: 'Course assignments retrieved successfully' })
  async getAssignmentsByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.getAssignmentsByCourse(courseId);
  }
}