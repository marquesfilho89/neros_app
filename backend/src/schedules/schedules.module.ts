import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { CoverageService } from './coverage.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, CoverageService],
  exports: [CoverageService],
})
export class SchedulesModule {}
