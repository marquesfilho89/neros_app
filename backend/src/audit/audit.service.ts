import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes ?? {},
      },
    });
  }
}
