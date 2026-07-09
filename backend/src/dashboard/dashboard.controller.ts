import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('dashboard-data')
  getDashboardData(@Req() req) {
    return this.dashboardService.getDashboardData(req.user.tenantId);
  }
}
