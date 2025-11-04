import { Body, Controller, Post } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';

@Controller('payment-management')
export class PaymentManagementController {
  constructor(
    private readonly paymentManagementService: PaymentManagementService,
  ) {}

  @Post()
  createPaymentManagementTransaction(@Body() body: any) {
    return this.paymentManagementService.create(body);
  }
}
