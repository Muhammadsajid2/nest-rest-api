import { Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './schemas/sub-category.schema';
import { SubCategoryRepository } from './sub-category.repository';
import { IFindByIdQueryParams, IPaginationQueryParams } from '../decorators';
import { stringToObject } from 'src/util/string-to-object.util';

@Injectable()
export class SubCategoryService {
  constructor(private readonly subCategoryRepository: SubCategoryRepository) {}

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    return this.subCategoryRepository.create(
      createSubCategoryDto,
    ) as Promise<SubCategory>;
  }

  async findAll(paginationQueryParams: IPaginationQueryParams) {
    const { limit, offset, sort, filter, populate, populateSelect, search } =
      paginationQueryParams;
    return this.subCategoryRepository.findPaginatedLean(
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
  ): Promise<SubCategory> {
    const { populate, populateSelect } = queryParams || {};
    return this.subCategoryRepository.findById(id, {
      populate,
      populateSelect,
    });
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    return this.subCategoryRepository.updateById(id, updateSubCategoryDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.subCategoryRepository.deleteOne({ _id: id });
  }
}
