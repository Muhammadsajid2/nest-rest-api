import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { Alert } from './schemas/alert.schema';

@Injectable()
export class AlertRepository extends EntityRepository<Alert> {
  constructor(
    @InjectModel(Alert.name) alertModel: Model<Alert>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: alertModel, errLogger: true, connection });
  }
}
