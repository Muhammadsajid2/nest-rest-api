import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthRepository extends EntityRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: userModel, errLogger: true, connection });
  }
}
