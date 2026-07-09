import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageService } from '../schedules/coverage.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private coverageService: CoverageService,
  ) {}

  async getDashboardData(tenantId: string) {
    const stores = await this.prisma.store.findMany({
      where: { tenantId },
      include: {
        _count: { select: { employees: true, schedules: true } },
      },
    });

    const totalStores = stores.length;
    const totalEmployees = stores.reduce((acc, s) => acc + s._count.employees, 0);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const schedules = await this.prisma.schedule.findMany({
      where: {
        store: { tenantId },
        date: { gte: weekStart, lt: weekEnd },
      },
      include: { store: true },
    });

    const coverageAlerts: Array<{
      storeName: string;
      date: string;
      peakStart: string;
      peakEnd: string;
      coveragePercent: number;
      minCoverage: number;
    }> = [];

    for (const store of stores) {
      const peakHours = store.peakHours as Array<{ start: string; end: string; minCoverage: number }>;
      if (!peakHours) continue;

      for (let d = new Date(weekStart); d < weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const daySchedules = schedules.filter(
          (s) => s.storeId === store.id && s.date.toISOString().split('T')[0] === dateStr,
        );

        for (const peak of peakHours) {
          const coveredCount = this.countOperators(daySchedules, peak.start, peak.end);
          const coveragePercent = store.numberOfCheckouts > 0
            ? (coveredCount / store.numberOfCheckouts) * 100
            : 0;

          if (coveragePercent < peak.minCoverage) {
            coverageAlerts.push({
              storeName: store.name,
              date: dateStr,
              peakStart: peak.start,
              peakEnd: peak.end,
              coveragePercent: Math.round(coveragePercent),
              minCoverage: peak.minCoverage,
            });
          }
        }
      }
    }

    const pendingSwaps = await this.prisma.shiftSwapRequest.count({
      where: { tenantId, status: { in: ['PENDING_TARGET', 'WAITING_MANAGER'] } },
    });

    const hourlyDistribution: Record<string, number> = {};
    for (let h = 6; h <= 22; h++) {
      hourlyDistribution[`${h.toString().padStart(2, '0')}:00`] = 0;
    }

    for (const s of schedules) {
      const startHour = parseInt(s.shiftStart.split(':')[0], 10);
      const endHour = parseInt(s.shiftEnd.split(':')[0], 10);
      for (let h = startHour; h < endHour; h++) {
        const key = `${h.toString().padStart(2, '0')}:00`;
        if (hourlyDistribution[key] !== undefined) {
          hourlyDistribution[key]++;
        }
      }
    }

    const auditFeed = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } },
    });

    return {
      stats: {
        totalStores,
        totalEmployees,
        coverageAlertCount: coverageAlerts.length,
        pendingSwaps,
      },
      coverageAlerts: coverageAlerts.slice(0, 20),
      hourlyDistribution,
      auditFeed: auditFeed.map((log) => ({
        id: log.id,
        userName: log.user.name,
        action: log.action,
        entityType: log.entityType,
        createdAt: log.createdAt,
      })),
    };
  }

  private countOperators(
    schedules: Array<{ shiftStart: string; shiftEnd: string }>,
    peakStart: string,
    peakEnd: string,
  ): number {
    const [pSH, pSM] = peakStart.split(':').map(Number);
    const [pEH, pEM] = peakEnd.split(':').map(Number);
    const peakStartMinutes = pSH * 60 + pSM;
    const peakEndMinutes = pEH * 60 + pEM;

    return schedules.filter((s) => {
      const [sSH, sSM] = s.shiftStart.split(':').map(Number);
      const [sEH, sEM] = s.shiftEnd.split(':').map(Number);
      const shiftStartMinutes = sSH * 60 + sSM;
      const shiftEndMinutes = sEH * 60 + sEM;

      return shiftEndMinutes > peakStartMinutes && shiftStartMinutes < peakEndMinutes;
    }).length;
  }
}
