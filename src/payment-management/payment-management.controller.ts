import { Body, Controller, Post } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';
import { CreatePaymentDto } from './dto';

@Controller('payment-management')
export class PaymentManagementController {
  constructor(
    private readonly paymentManagementService: PaymentManagementService,
  ) {}

  @Post()
  createPaymentManagementTransaction(@Body() body: CreatePaymentDto) {
    return this.paymentManagementService.create(body);
  }
}
