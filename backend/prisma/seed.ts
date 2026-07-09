import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '00000000000000' },
    update: {},
    create: {
      name: 'Supermercado Demo',
      cnpj: '00000000000000',
      isActive: true,
      roleConfig: {
        level1: 'Fiscal',
        level2: 'Assistente',
        level3: 'Gerente',
      },
    },
  });

  const store = await prisma.store.upsert({
    where: { id: 'store_demo' },
    update: {},
    create: {
      id: 'store_demo',
      tenantId: tenant.id,
      name: 'Loja Centro',
      address: 'Rua Principal, 100',
      numberOfCheckouts: 5,
      shiftConfig: [
        { name: 'Abertura', start: '08:00', end: '12:00' },
        { name: 'Almoco', start: '12:00', end: '14:00' },
        { name: 'Fechamento', start: '14:00', end: '18:00' },
      ],
      peakHours: [
        { start: '12:00', end: '14:00', minCoverage: 80 },
        { start: '17:00', end: '19:00', minCoverage: 60 },
      ],
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@neros.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@neros.com',
      password: hashedPassword,
      level: 3,
      tenantId: tenant.id,
      storeId: store.id,
    },
  });

  const employees = [];
  const names = ['Ana Silva', 'Carlos Souza', 'Maria Santos', 'Joao Lima', 'Pedro Costa'];
  for (let i = 0; i < names.length; i++) {
    const emp = await prisma.employee.upsert({
      where: { matricula_storeId: { matricula: `MAT${String(i + 1).padStart(3, '0')}`, storeId: store.id } },
      update: {},
      create: {
        matricula: `MAT${String(i + 1).padStart(3, '0')}`,
        name: names[i],
        level: i < 2 ? 1 : i < 4 ? 2 : 3,
        storeId: store.id,
      },
    });
    employees.push(emp);
  }

  const today = new Date();
  for (let d = 0; d < 5; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    date.setHours(0, 0, 0, 0);

    for (const emp of employees) {
      const shiftIndex = employees.indexOf(emp) % 3;
      const shifts = [
        { name: 'Abertura', start: '08:00', end: '12:00' },
        { name: 'Almoco', start: '12:00', end: '14:00' },
        { name: 'Fechamento', start: '14:00', end: '18:00' },
      ];
      const shift = shifts[shiftIndex];

      await prisma.schedule.upsert({
        where: { id: `sched_${emp.id}_${d}` },
        update: {},
        create: {
          id: `sched_${emp.id}_${d}`,
          storeId: store.id,
          employeeId: emp.id,
          date,
          shiftStart: shift.start,
          shiftEnd: shift.end,
          shiftName: shift.name,
        },
      });
    }
  }

  console.log('Seed concluido com sucesso!');
  console.log(`Tenant: ${tenant.name}`);
  console.log(`Store: ${store.name}`);
  console.log(`Admin: admin@neros.com / admin123`);
  console.log(`${employees.length} funcionarios criados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
