import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import {
  FindByIdQueryParams,
  IFindByIdQueryParams,
  IPaginationQueryParams,
  PaginationQueryParams,
} from '../decorators';

@Controller('videos')
// @UseGuards(AuthGuard('jwt'))
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  create(@Body() createVideoDto: CreateVideoDto, @Req() req: any) {
    createVideoDto.createdBy = req.user?._id || req.user?.id;
    return this.videoService.create(createVideoDto);
  }

  @Get()
  findAll(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.videoService.findAll(paginationQueryParams);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.videoService.findOne(id, queryParams);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videoService.update(id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(id);
  }
}
