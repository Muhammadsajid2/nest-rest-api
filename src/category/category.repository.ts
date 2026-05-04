import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityRepository } from 'src/common/mongo-abstract.repository';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryRepository extends EntityRepository<Category> {
  constructor(
    @InjectModel(Category.name) categoryModel: Model<Category>,
    @InjectConnection() connection: Connection,
  ) {
    super({ entityModel: categoryModel, errLogger: true, connection });
  }
}
