import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(AuthGuard('jwt'))
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  findByStore(@Query('storeId') storeId: string) {
    return this.employeesService.findByStore(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  create(@Body() body: { matricula: string; name: string; level: number; storeId: string }) {
    return this.employeesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; level?: number }) {
    return this.employeesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
