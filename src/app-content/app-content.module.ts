import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { SubCategory, SubCategorySchema } from '../sub-category/schemas/sub-category.schema';
import { Video, VideoSchema } from '../video/schemas/video.schema';
import { AppContentController } from './app-content.controller';
import { AppContentService } from './app-content.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Video.name, schema: VideoSchema },
    ]),
  ],
  controllers: [AppContentController],
  providers: [AppContentService],
})
export class AppContentModule {}
