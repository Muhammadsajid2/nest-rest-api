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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  FindByIdQueryParams,
  IFindByIdQueryParams,
  IPaginationQueryParams,
  PaginationQueryParams,
} from '../decorators';

@Controller('category')
// @UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    createCategoryDto.createdBy = req.user?._id || req.user?.id;
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.categoryService.findAll(paginationQueryParams);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.categoryService.findOne(id, queryParams);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
