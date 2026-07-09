import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.store.create({
      data: {
        ...dto,
        shiftConfig: dto.shiftConfig ?? [
          { name: 'Abertura', start: '08:00', end: '12:00' },
          { name: 'Almoco', start: '12:00', end: '14:00' },
          { name: 'Fechamento', start: '14:00', end: '18:00' },
        ],
        peakHours: dto.peakHours ?? [
          { start: '12:00', end: '14:00', minCoverage: 80 },
        ],
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Loja nao encontrada');

    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Loja nao encontrada');

    await this.prisma.store.delete({ where: { id } });
    return { message: 'Loja removida com sucesso' };
  }
}
