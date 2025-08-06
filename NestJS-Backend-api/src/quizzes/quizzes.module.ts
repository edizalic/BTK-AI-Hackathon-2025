import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [QuizzesService, QuizAttemptsService],
  controllers: [QuizzesController, QuizAttemptsController],
  exports: [QuizzesService, QuizAttemptsService],
})
export class QuizzesModule {}