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

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { UserWithProfile } from './interfaces/user-with-profile.interface';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UserFiltersDto } from './dto/user-filters.dto';
import { AssignAdvisoryDto } from './dto/assign-advisory.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('students')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Register a new student (supervisors only)' })
  @ApiResponse({ status: 201, description: 'Student registered successfully' })
  @AuditLog('REGISTER_STUDENT')
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.usersService.createStudent(createStudentDto, user.id);
  }

  @Post('teachers')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Register a new teacher (supervisors only)' })
  @ApiResponse({ status: 201, description: 'Teacher registered successfully' })
  @AuditLog('REGISTER_TEACHER')
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.usersService.createTeacher(createTeacherDto, user.id);
  }

  @Post('supervisors')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register a new supervisor (admins only)' })
  @ApiResponse({ status: 201, description: 'Supervisor registered successfully' })
  @AuditLog('REGISTER_SUPERVISOR')
  async createSupervisor(
    @Body() createSupervisorDto: CreateSupervisorDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.usersService.createSupervisor(createSupervisorDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() filters: UserFiltersDto) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post(':studentId/advisory')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Assign advisory teacher to student' })
  @ApiResponse({ status: 200, description: 'Advisory teacher assigned successfully' })
  @AuditLog('ASSIGN_ADVISORY_TEACHER')
  async assignAdvisoryTeacher(
    @Param('studentId') studentId: string,
    @Body() assignAdvisoryDto: AssignAdvisoryDto,
    @CurrentUser() user: UserWithProfile,
  ) {
    return this.usersService.assignAdvisoryTeacher(
      { ...assignAdvisoryDto, studentId },
      user.id,
    );
  }

  @Get('stats/overview')
  @Roles(UserRole.SUPERVISOR_TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Put(':userId/reset-password')
  @Roles(UserRole.SUPERVISOR_TEACHER)
  @ApiOperation({ summary: 'Reset password for a student or teacher (supervisors only)' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot reset this user\'s password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @AuditLog('RESET_USER_PASSWORD')
  async resetUserPassword(
    @Param('userId') userId: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() supervisor: UserWithProfile,
  ) {
    return this.usersService.resetUserPassword(
      userId,
      resetPasswordDto.newPassword,
      supervisor.id,
    );
  }
}