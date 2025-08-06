import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { ActivityLoggerService } from './activity-logger.service';

@Module({
  providers: [AuditService, ActivityLoggerService],
  controllers: [AuditController],
  exports: [AuditService, ActivityLoggerService],
})
export class AuditModule {}