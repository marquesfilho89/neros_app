import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { SchedulesModule } from './schedules/schedules.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { EmployeesModule } from './employees/employees.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StoresModule,
    SchedulesModule,
    DashboardModule,
    AuditModule,
    EmployeesModule,
    BillingModule,
  ],
})
export class AppModule {}
