import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './schemas/video.schema';
import { VideoRepository } from './video.repository';
import { IFindByIdQueryParams, IPaginationQueryParams } from '../decorators';
import { stringToObject } from 'src/util/string-to-object.util';
import { VideoLinkType } from './constants/link-type.enum';

// Clear keys only belong to MPD links, so drop them for any other link type.
const normalizeClearKeys = <T extends Partial<CreateVideoDto>>(dto: T): T => {
  if (dto.linkType && dto.linkType !== VideoLinkType.MPD) {
    return { ...dto, clearKey1: null, clearKey2: null };
  }
  return dto;
};

@Injectable()
export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    return this.videoRepository.create(
      normalizeClearKeys(createVideoDto),
    ) as Promise<Video>;
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
    // PartialType makes every field optional, so enforce the MPD key rule
    // against the stored record as well.
    if (updateVideoDto.linkType === VideoLinkType.MPD) {
      const existing = await this.videoRepository.findById(id);
      const clearKey1 = updateVideoDto.clearKey1 ?? existing?.clearKey1;
      const clearKey2 = updateVideoDto.clearKey2 ?? existing?.clearKey2;
      if (!clearKey1 || !clearKey2) {
        throw new BadRequestException(
          'clearKey1 and clearKey2 are required when linkType is mpd',
        );
      }
    }

    return this.videoRepository.updateById(
      id,
      normalizeClearKeys(updateVideoDto),
    );
  }

  async remove(id: string): Promise<boolean> {
    return this.videoRepository.deleteOne({ _id: id });
  }
}
