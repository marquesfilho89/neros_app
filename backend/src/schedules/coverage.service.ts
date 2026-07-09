import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PeakHour {
  start: string;
  end: string;
  minCoverage: number;
}

interface CoverageResult {
  isCovered: boolean;
  alerts: Array<{
    peakStart: string;
    peakEnd: string;
    currentOperators: number;
    requiredOperators: number;
    coveragePercent: number;
    minCoverage: number;
  }>;
}

@Injectable()
export class CoverageService {
  constructor(private prisma: PrismaService) {}

  async validateCoverage(
    storeId: string,
    date: string,
    scheduleStart?: string,
    scheduleEnd?: string,
  ): Promise<CoverageResult> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return { isCovered: true, alerts: [] };
    }

    const peakHours = store.peakHours as unknown as PeakHour[];
    const totalCheckouts = store.numberOfCheckouts;

    if (!peakHours || peakHours.length === 0) {
      return { isCovered: true, alerts: [] };
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedules = await this.prisma.schedule.findMany({
      where: {
        storeId,
        date: { gte: targetDate, lt: nextDay },
      },
    });

    const alerts: CoverageResult['alerts'] = [];

    for (const peak of peakHours) {
      const coveredCount = this.countOperatorsInPeak(schedules, peak.start, peak.end, scheduleStart, scheduleEnd);

      const coveragePercent = totalCheckouts > 0
        ? (coveredCount / totalCheckouts) * 100
        : 0;

      if (coveragePercent < peak.minCoverage) {
        alerts.push({
          peakStart: peak.start,
          peakEnd: peak.end,
          currentOperators: coveredCount,
          requiredOperators: Math.ceil((peak.minCoverage / 100) * totalCheckouts),
          coveragePercent: Math.round(coveragePercent),
          minCoverage: peak.minCoverage,
        });
      }
    }

    return {
      isCovered: alerts.length === 0,
      alerts,
    };
  }

  private countOperatorsInPeak(
    schedules: Array<{ shiftStart: string; shiftEnd: string }>,
    peakStart: string,
    peakEnd: string,
    newShiftStart?: string,
    newShiftEnd?: string,
  ): number {
    let count = 0;

    const [pSH, pSM] = peakStart.split(':').map(Number);
    const [pEH, pEM] = peakEnd.split(':').map(Number);
    const peakStartMinutes = pSH * 60 + pSM;
    const peakEndMinutes = pEH * 60 + pEM;

    for (const s of schedules) {
      const [sSH, sSM] = s.shiftStart.split(':').map(Number);
      const [sEH, sEM] = s.shiftEnd.split(':').map(Number);
      const shiftStartMinutes = sSH * 60 + sSM;
      const shiftEndMinutes = sEH * 60 + sEM;

      if (shiftEndMinutes > peakStartMinutes && shiftStartMinutes < peakEndMinutes) {
        count++;
      }
    }

    if (newShiftStart && newShiftEnd) {
      const [nSH, nSM] = newShiftStart.split(':').map(Number);
      const [nEH, nEM] = newShiftEnd.split(':').map(Number);
      const newStartMinutes = nSH * 60 + nSM;
      const newEndMinutes = nEH * 60 + nEM;

      if (newEndMinutes > peakStartMinutes && newStartMinutes < peakEndMinutes) {
        count++;
      }
    }

    return count;
  }
}
