import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { Video } from './schemas/video.schema';

@Injectable()
export class VideoRepository extends EntityRepository<Video> {
  constructor(
    @InjectModel(Video.name) videoModel: Model<Video>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: videoModel, errLogger: true, connection });
  }
}
