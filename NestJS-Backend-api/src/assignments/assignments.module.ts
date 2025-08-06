import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AssignmentsService, SubmissionsService],
  controllers: [AssignmentsController, SubmissionsController],
  exports: [AssignmentsService, SubmissionsService],
})
export class AssignmentsModule {}