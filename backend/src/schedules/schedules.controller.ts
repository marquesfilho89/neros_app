import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/create-schedule.dto';

@Controller('schedules')
@UseGuards(AuthGuard('jwt'))
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get('store/:storeId')
  findByStore(
    @Param('storeId') storeId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.schedulesService.findByStore(storeId, start, end);
  }

  @Post()
  create(@Req() req, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
