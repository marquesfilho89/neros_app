import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class BillingService {
  private asaasApi: string;
  private asaasToken: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.asaasApi = this.config.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3';
    this.asaasToken = this.config.get('ASAAS_API_TOKEN') || '';
  }

  private get headers() {
    return {
      access_token: this.asaasToken,
      'Content-Type': 'application/json',
    };
  }

  async createCustomer(tenantId: string, name: string, cpfCnpj: string) {
    const response = await axios.post(
      `${this.asaasApi}/customers`,
      { name, cpfCnpj },
      { headers: this.headers },
    );
    return response.data;
  }

  async createSubscription(customerId: string, value: number, nextDueDay: number) {
    const response = await axios.post(
      `${this.asaasApi}/subscriptions`,
      {
        customer: customerId,
        billingType: 'BOLETO',
        value,
        nextDueDay,
        cycle: 'MONTHLY',
        description: 'Assinatura Neros - Gestao de Escala',
      },
      { headers: this.headers },
    );
    return response.data;
  }

  async getPayments(subscriptionId: string) {
    const response = await axios.get(
      `${this.asaasApi}/subscriptions/${subscriptionId}/payments`,
      { headers: this.headers },
    );
    return response.data;
  }

  async webhook(body: any) {
    const event = body.event;
    const payment = body.payment;

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      await this.prisma.paymentLog.upsert({
        where: { asaasId: payment.id },
        update: {
          status: payment.status,
          paidAt: payment.paidDate ? new Date(payment.paidDate) : null,
        },
        create: {
          asaasId: payment.id,
          tenantId: payment.externalReference || '',
          status: payment.status,
          valueCents: Math.round(payment.value * 100),
          dueDate: payment.dueDate ? new Date(payment.dueDate) : null,
          paidAt: payment.paidDate ? new Date(payment.paidDate) : null,
          invoiceUrl: payment.invoiceUrl,
        },
      });
    }

    return { received: true };
  }
}
