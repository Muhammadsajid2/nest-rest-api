import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import { SubCategory, SubCategoryDocument } from '../sub-category/schemas/sub-category.schema';
import { Video, VideoDocument } from '../video/schemas/video.schema';
import { VideoLinkType } from '../video/constants/link-type.enum';

@Injectable()
export class AppContentService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategoryDocument>,
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
  ) {}

  // Older records used single references before these fields became multi-select.
  private asArray<T>(value: T | T[] | null | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  // Older videos have no linkType saved; they were all HLS (m3u8) links.
  private getLinkFields(video: Partial<Video>) {
    const linkType = video.linkType || VideoLinkType.M3U8;
    const isMpd = linkType === VideoLinkType.MPD;
    return {
      linkType,
      clearKey1: isMpd ? video.clearKey1 || null : null,
      clearKey2: isMpd ? video.clearKey2 || null : null,
    };
  }

  async getContent() {
    const [categories, subCategories, videos] = await Promise.all([
      this.categoryModel.find().sort({ createdAt: -1 }).lean(),
      this.subCategoryModel.find().sort({ createdAt: -1 }).lean(),
      this.videoModel.find().sort({ createdAt: -1 }).lean(),
    ]);

    return {
      app_name: process.env.APP_NAME || 'Task Pilot',
      videos: categories.map((category) => ({
        category_id: category._id.toString(),
        category_name: category.name,
        subcategories: subCategories
          .filter((subCategory) =>
            this.asArray(subCategory.category).some(
              (categoryId) => categoryId.toString() === category._id.toString(),
            ),
          )
          .map((subCategory) => ({
            subcategory_id: subCategory._id.toString(),
            subcategory_name: subCategory.name,
            subcategory_thumbnail: subCategory.img,
            videos: videos
              .filter(
                (video) =>
                  this.asArray(video.subCategory).some(
                    (subCategoryId) =>
                      subCategoryId.toString() === subCategory._id.toString(),
                  ),
              )
              .map((video) => ({
                id: video._id.toString(),
                category_id: category._id.toString(),
                subcategory_id: subCategory._id.toString(),
                label: video.label,
                thumbnail: video.img,
                // The requested mobile schema uses one URL; Task Pilot stores multiple URLs.
                url: this.asArray(video.url)[0] || null,
                description: video.description || '',
                highlights: Boolean(video.highlights),
                ...this.getLinkFields(video),
              })),
          })),
      })),
    };
  }

  async getVideosContent() {
    const videos = await this.videoModel.find().sort({ createdAt: -1 }).lean();

    return {
      app_name: process.env.APP_NAME || 'Task Pilot',
      videos: videos.map((video) => ({
        id: video._id.toString(),
        category_id: video.category?.toString() || null,
        label: video.label,
        url: this.asArray(video.url)[0] || null,
        thumbnail: video.img,
        ...this.getLinkFields(video),
      })),
    };
  }
}
