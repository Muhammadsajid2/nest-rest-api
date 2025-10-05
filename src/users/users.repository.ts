import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository extends EntityRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: userModel, errLogger: true, connection });
  }
}
