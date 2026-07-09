import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findByStore(storeId: string) {
    return this.prisma.employee.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { _count: { select: { schedules: true } } },
    });
    if (!employee) throw new NotFoundException('Funcionario nao encontrado');
    return employee;
  }

  async create(data: { matricula: string; name: string; level: number; storeId: string }) {
    const existing = await this.prisma.employee.findUnique({
      where: { matricula_storeId: { matricula: data.matricula, storeId: data.storeId } },
    });
    if (existing) throw new ConflictException('Matricula ja existe nesta loja');

    return this.prisma.employee.create({ data });
  }

  async update(id: string, data: { name?: string; level?: number }) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Funcionario nao encontrado');

    return this.prisma.employee.update({ where: { id }, data });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Funcionario nao encontrado');

    await this.prisma.$transaction([
      this.prisma.schedule.deleteMany({ where: { employeeId: id } }),
      this.prisma.employee.delete({ where: { id } }),
    ]);
    return { message: 'Funcionario removido com sucesso' };
  }
}
