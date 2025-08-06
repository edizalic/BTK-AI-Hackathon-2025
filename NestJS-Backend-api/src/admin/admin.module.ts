import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, CoursesModule, AuditModule],
  providers: [AdminService, SystemService],
  controllers: [AdminController, SystemController],
  exports: [AdminService, SystemService],
})
export class AdminModule {}