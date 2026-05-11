import { Module } from '@nestjs/common';
import { PhoneController } from './phone.controller';
import { CategoryModule } from '../category/category.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [CategoryModule, SubCategoryModule, VideoModule],
  controllers: [PhoneController],
})
export class PhoneModule {}
