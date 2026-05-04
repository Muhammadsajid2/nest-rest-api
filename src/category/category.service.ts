import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.schema';
import { CategoryRepository } from './category.repository';
import { IFindByIdQueryParams, IPaginationQueryParams } from '../decorators';
import { stringToObject } from 'src/util/string-to-object.util';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(
      createCategoryDto,
    ) as Promise<Category>;
  }

  async findAll(paginationQueryParams: IPaginationQueryParams) {
    const { limit, offset, sort, filter, populate, populateSelect, search } =
      paginationQueryParams;
    return this.categoryRepository.findPaginatedLean(
      {
        ...filter,

        ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
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
  ): Promise<Category> {
    const { populate, populateSelect } = queryParams;
    return this.categoryRepository.findById(id, {
      populate,
      populateSelect,
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryRepository.updateById(id, updateCategoryDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.categoryRepository.deleteOne({ _id: id });
  }
}
