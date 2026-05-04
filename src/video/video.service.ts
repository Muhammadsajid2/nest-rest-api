import { Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './schemas/video.schema';
import { VideoRepository } from './video.repository';
import { IFindByIdQueryParams, IPaginationQueryParams } from '../decorators';
import { stringToObject } from 'src/util/string-to-object.util';

@Injectable()
export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    return this.videoRepository.create(createVideoDto) as Promise<Video>;
  }

  async findAll(paginationQueryParams: IPaginationQueryParams) {
    const { limit, offset, sort, filter, populate, populateSelect, search } =
      paginationQueryParams;
    return this.videoRepository.findPaginatedLean(
      {
        ...filter,
        ...(search ? { label: { $regex: search, $options: 'i' } } : {}),
      },
      {
        skip: offset,
        limit,
        sort: stringToObject(sort),
        populate,
        populateSelect,
      },
    );
  }

  async findOne(
    id: string,
    queryParams?: IFindByIdQueryParams,
  ): Promise<Video> {
    const { populate, populateSelect } = queryParams || {};
    return this.videoRepository.findById(id, {
      populate,
      populateSelect,
    });
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    return this.videoRepository.updateById(id, updateVideoDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.videoRepository.deleteOne({ _id: id });
  }
}
