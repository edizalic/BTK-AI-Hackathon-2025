import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CoursesService, EnrollmentService],
  controllers: [CoursesController, EnrollmentController],
  exports: [CoursesService, EnrollmentService],
})
export class CoursesModule {}