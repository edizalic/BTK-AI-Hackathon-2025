import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_LOG_KEY } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(AUDIT_LOG_KEY, context.getHandler());
    
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, headers } = request;
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap(() => {
        // Log successful action
        this.logger.log(`Action: ${action} | User: ${user?.id || 'anonymous'} | IP: ${ip}`);
      }),
      catchError((error) => {
        // Log failed action
        this.logger.error(`Failed Action: ${action} | User: ${user?.id || 'anonymous'} | IP: ${ip} | Error: ${error.message}`);
        throw error;
      }),
    );
  }
}