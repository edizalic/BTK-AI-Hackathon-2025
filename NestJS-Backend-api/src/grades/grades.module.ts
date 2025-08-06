import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradeCalculationService } from './grade-calculation.service';

@Module({
  providers: [GradesService, GradeCalculationService],
  controllers: [GradesController],
  exports: [GradesService, GradeCalculationService],
})
export class GradesModule {}