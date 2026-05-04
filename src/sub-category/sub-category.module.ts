import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { SubCategory, SubCategorySchema } from './schemas/sub-category.schema';
import { SubCategoryRepository } from './sub-category.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [SubCategoryController],
  providers: [SubCategoryService, SubCategoryRepository],
  exports: [SubCategoryService, SubCategoryRepository],
})
export class SubCategoryModule {}
