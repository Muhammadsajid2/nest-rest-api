import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { SubCategory } from './schemas/sub-category.schema';

@Injectable()
export class SubCategoryRepository extends EntityRepository<SubCategory> {
  constructor(
    @InjectModel(SubCategory.name) subCategoryModel: Model<SubCategory>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: subCategoryModel, errLogger: true, connection });
  }
}
