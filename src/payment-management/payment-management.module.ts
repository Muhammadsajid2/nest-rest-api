import { Module } from '@nestjs/common';
import { PaymentManagementController } from './payment-management.controller';
import { PaymentManagementService } from './payment-management.service';
import { PaymentManagementRepository } from './payment-management.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentManagement,
  PaymentManagementSchema,
} from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentManagement.name, schema: PaymentManagementSchema },
    ]),
  ],
  controllers: [PaymentManagementController],
  providers: [PaymentManagementService, PaymentManagementRepository],
})
export class PaymentManagementModule {}
