import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { DatabaseModule } from './database/database.module';
import { ConfigurationModule } from './config/configuration.module';
import { CommonModule } from './common/common.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { GradesModule } from './grades/grades.module';
import { MaterialsModule } from './materials/materials.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FilesModule } from './files/files.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { PagesModule } from './pages/pages.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Core modules
    ConfigurationModule,
    DatabaseModule,
    CommonModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CoursesModule,
    AssignmentsModule,
    GradesModule,
    MaterialsModule,
    QuizzesModule,
    NotificationsModule,
    FilesModule,
    AdminModule,
    AuditModule,
    PagesModule,
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}