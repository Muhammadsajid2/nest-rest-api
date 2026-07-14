import { Controller, Get } from '@nestjs/common';
import { AppContentService } from './app-content.service';

@Controller('app-content')
export class AppContentController {
  constructor(private readonly appContentService: AppContentService) {}

  @Get()
  getContent() {
    return this.appContentService.getContent();
  }

  @Get('videos')
  getVideosContent() {
    return this.appContentService.getVideosContent();
  }
}
