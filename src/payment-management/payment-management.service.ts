import { Injectable } from '@nestjs/common';
import { PaymentManagementRepository } from './payment-management.repository';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentManagementService {
  constructor(
    private readonly paymentManagementRepository: PaymentManagementRepository,
  ) {}

  create(body: CreatePaymentDto) {
    return this.paymentManagementRepository.create(body);
  }
}
