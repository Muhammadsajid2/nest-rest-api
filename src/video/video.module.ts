import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { Video, VideoSchema } from './schemas/video.schema';
import { VideoRepository } from './video.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository],
  exports: [VideoService, VideoRepository],
})
export class VideoModule {}
