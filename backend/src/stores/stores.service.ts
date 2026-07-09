import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.store.findMany({
      where: { tenantId },
      include: { _count: { select: { employees: true, schedules: true } } },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { _count: { select: { employees: true, schedules: true } } },
    });
    if (!store) throw new NotFoundException('Loja nao encontrada');
    return store;
  }

  async create(tenantId: string, dto: CreateStoreDto) {
    const data: Prisma.StoreCreateInput = {
      name: dto.name,
      address: dto.address,
      numberOfCheckouts: dto.numberOfCheckouts,
      shiftConfig: (dto.shiftConfig ?? [
        { name: 'Abertura', start: '08:00', end: '12:00' },
        { name: 'Almoco', start: '12:00', end: '14:00' },
        { name: 'Fechamento', start: '14:00', end: '18:00' },
      ]) as unknown as Prisma.InputJsonValue,
      peakHours: (dto.peakHours ?? [
        { start: '12:00', end: '14:00', minCoverage: 80 },
      ]) as unknown as Prisma.InputJsonValue,
      tenant: { connect: { id: tenantId } },
    };

    return this.prisma.store.create({ data });
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Loja nao encontrada');

    const data: Prisma.StoreUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.numberOfCheckouts !== undefined) data.numberOfCheckouts = dto.numberOfCheckouts;
    if (dto.shiftConfig !== undefined) data.shiftConfig = dto.shiftConfig as unknown as Prisma.InputJsonValue;
    if (dto.peakHours !== undefined) data.peakHours = dto.peakHours as unknown as Prisma.InputJsonValue;

    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Loja nao encontrada');

    await this.prisma.store.delete({ where: { id } });
    return { message: 'Loja removida com sucesso' };
  }
}
