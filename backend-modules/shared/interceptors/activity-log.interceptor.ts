import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { ActivityLogEntity } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogRepository: Repository<ActivityLogEntity>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl: string;
      user?: { sub?: string };
    }>();

    return next.handle().pipe(
      tap(async () => {
        await this.activityLogRepository.save({
          actorUserId: request.user?.sub ?? null,
          action: `${request.method} ${request.originalUrl}`,
          resourceType: 'http',
          metadata: {},
        });
      }),
    );
  }
}
