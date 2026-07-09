import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageService } from './coverage.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private coverageService: CoverageService,
  ) {}

  async findByStore(storeId: string, startDate?: string, endDate?: string) {
    const where: any = { storeId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, matricula: true, level: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateScheduleDto) {
    const scheduleDate = new Date(dto.date);

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Funcionario nao encontrado');

    const schedule = await this.prisma.schedule.create({
      data: {
        storeId: employee.storeId,
        employeeId: dto.employeeId,
        date: scheduleDate,
        shiftStart: dto.shiftStart,
        shiftEnd: dto.shiftEnd,
        shiftName: dto.shiftName,
      },
    });

    const coverage = await this.coverageService.validateCoverage(
      employee.storeId,
      dto.date,
    );

    if (!coverage.isCovered) {
      return { schedule, coverageAlert: coverage.alerts };
    }

    return { schedule };
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const existing = await this.prisma.schedule.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!existing) throw new NotFoundException('Escala nao encontrada');

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        shiftStart: dto.shiftStart ?? existing.shiftStart,
        shiftEnd: dto.shiftEnd ?? existing.shiftEnd,
        shiftName: dto.shiftName ?? existing.shiftName,
      },
    });

    const dateStr = existing.date.toISOString().split('T')[0];
    const coverage = await this.coverageService.validateCoverage(
      existing.storeId,
      dateStr,
    );

    if (!coverage.isCovered) {
      return { schedule: updated, coverageAlert: coverage.alerts };
    }

    return { schedule: updated };
  }

  async remove(id: string) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Escala nao encontrada');

    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Escala removida com sucesso' };
  }
}
