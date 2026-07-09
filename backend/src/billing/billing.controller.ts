import { Controller, Post, Body } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.billingService.webhook(body);
  }
}
