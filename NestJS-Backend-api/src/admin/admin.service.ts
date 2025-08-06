import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateSupervisorDto } from '../users/dto/create-supervisor.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async registerSupervisor(dto: CreateSupervisorDto, adminId: string) {
    return this.usersService.createSupervisor(dto, adminId);
  }

  async getSystemStats() {
    const [userStats, courseStats, assignmentStats] = await Promise.all([
      this.usersService.getUserStats(),
      this.getCourseStats(),
      this.getAssignmentStats(),
    ]);

    return {
      users: userStats,
      courses: courseStats,
      assignments: assignmentStats,
      timestamp: new Date().toISOString(),
    };
  }

  private async getCourseStats() {
    const [total, active, completed] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'ACTIVE' } }),
      this.prisma.course.count({ where: { status: 'COMPLETED' } }),
    ]);

    return { total, active, completed };
  }

  private async getAssignmentStats() {
    const [total, assigned, submitted, graded] = await Promise.all([
      this.prisma.assignment.count(),
      this.prisma.assignment.count({ where: { status: 'ASSIGNED' } }),
      this.prisma.assignment.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.assignment.count({ where: { status: 'GRADED' } }),
    ]);

    return { total, assigned, submitted, graded };
  }
}