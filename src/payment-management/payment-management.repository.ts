import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { PaymentManagement } from './schemas/payment.schema';

@Injectable()
export class PaymentManagementRepository extends EntityRepository<PaymentManagement> {
  constructor(
    @InjectModel(PaymentManagement.name) userModel: Model<PaymentManagement>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: userModel, errLogger: true, connection });
  }
}
