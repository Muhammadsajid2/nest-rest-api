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
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import {
  FindByIdQueryParams,
  IFindByIdQueryParams,
  IPaginationQueryParams,
  PaginationQueryParams,
} from '../decorators';

@Controller('sub-category')
// @UseGuards(AuthGuard('jwt'))
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  create(@Body() createSubCategoryDto: CreateSubCategoryDto, @Req() req: any) {
    createSubCategoryDto.createdBy = req.user?._id || req.user?.id;
    return this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  findAll(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.subCategoryService.findAll(paginationQueryParams);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.subCategoryService.findOne(id, queryParams);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoryService.update(id, updateSubCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id);
  }
}
