import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';

@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  findAll(@Req() req) {
    return this.storesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Post()
  create(@Req() req, @Body() dto: CreateStoreDto) {
    return this.storesService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
