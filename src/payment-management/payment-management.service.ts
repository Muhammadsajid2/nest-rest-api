import { Body, Injectable, Post, ValidationPipe } from '@nestjs/common';
import { PaymentManagementRepository } from './payment-management.repository';
import { CreateUserDto } from 'src/users/dto';

@Injectable()
export class PaymentManagementService {
  constructor(
    private readonly paymentManagementRepository: PaymentManagementRepository,
  ) {}

  @Post()
  create(
    @Body(ValidationPipe)
    body: CreateUserDto,
  ) {
    return this.paymentManagementRepository.create(body);
  }
}
