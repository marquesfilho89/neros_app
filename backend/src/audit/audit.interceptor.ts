import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.route?.path || request.url;

    const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (!mutationMethods.includes(method)) {
      return next.handle();
    }

    const entityMatch = url.match(/\/(\w+)\/?(\w*)/);
    const entityType = entityMatch ? entityMatch[1].replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase()) : 'Unknown';
    const entityId = entityMatch?.[2] || request.params?.id || 'new';

    return next.handle().pipe(
      tap((response) => {
        const user = request.user;
        if (!user) return;

        let action = '';
        switch (method) {
          case 'POST':
            action = `CREATE_${entityType.toUpperCase()}`;
            break;
          case 'PUT':
          case 'PATCH':
            action = `UPDATE_${entityType.toUpperCase()}`;
            break;
          case 'DELETE':
            action = `DELETE_${entityType.toUpperCase()}`;
            break;
        }

        if (action) {
          this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action,
            entityType,
            entityId: response?.id || entityId,
            changes: { method, body: request.body },
          }).catch((err) => console.error('Audit log error:', err));
        }
      }),
    );
  }
}
