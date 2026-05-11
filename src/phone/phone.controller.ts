import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from '../category/category.service';
import { SubCategoryService } from '../sub-category/sub-category.service';
import { VideoService } from '../video/video.service';
import {
  FindByIdQueryParams,
  IFindByIdQueryParams,
  IPaginationQueryParams,
  PaginationQueryParams,
} from '../decorators';
import { PhoneApiGuard } from './guards/phone-api.guard';

/**
 * Phone API — all routes require ?password=<PHONE_API_PASSWORD>
 *
 * GET /phone/categories
 * GET /phone/categories/:id
 * GET /phone/sub-categories
 * GET /phone/sub-categories/:id
 * GET /phone/videos
 * GET /phone/videos/:id
 */
@Controller('phone')
@UseGuards(PhoneApiGuard)
export class PhoneController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService,
    private readonly videoService: VideoService,
  ) {}

  // ─── Categories ──────────────────────────────────────────────────────────────

  @Get('categories')
  getCategories(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.categoryService.findAll(paginationQueryParams);
  }

  @Get('categories/:id')
  getCategoryById(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.categoryService.findOne(id, queryParams);
  }

  // ─── Sub-categories ───────────────────────────────────────────────────────────

  @Get('sub-categories')
  getSubCategories(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.subCategoryService.findAll(paginationQueryParams);
  }

  @Get('sub-categories/:id')
  getSubCategoryById(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.subCategoryService.findOne(id, queryParams);
  }

  // ─── Videos ──────────────────────────────────────────────────────────────────

  @Get('videos')
  getVideos(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.videoService.findAll(paginationQueryParams);
  }

  @Get('videos/:id')
  getVideoById(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.videoService.findOne(id, queryParams);
  }
}
