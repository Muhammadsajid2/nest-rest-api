import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateCurrentUserDto, UpdateUserDto } from './dto';
import { UsersRepository } from './users.repository';
import { IPaginationQueryParams } from 'src/decorators';
import { stringToObject } from 'src/util/string-to-object.util';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(paginationQueryParams: IPaginationQueryParams): Promise<any> {
    const { limit, offset, sort, filter, populate, populateSelect, search } =
      paginationQueryParams;
    // Escape regex characters so input like "a(b" is matched literally.
    const searchTerm = search?.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const whereFilter = {
      ...filter,
      ...(searchTerm ? { name: { $regex: searchTerm, $options: 'i' } } : {}),
    };

    return this.usersRepository.findPaginatedLean(whereFilter, {
      skip: offset,
      limit,
      sort: stringToObject(sort),
      populate,
      populateSelect,
    });
  }

  async findAllInterns() {
    return this.usersRepository.find({});
  }

  async getUser(id: string) {
    return this.usersRepository.findById(id);
  }

  async getCurrentUser(id: string) {
    return this.usersRepository.findById(id);
  }

  async updateCurrentUser(id: string, updateUserDto: UpdateCurrentUserDto) {
    return this.usersRepository.updateById(id, updateUserDto);
  }

  async createNewUser(createUserDto: CreateUserDto) {
    return this.usersRepository.create(createUserDto);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.findOneAndUpdate(
      { _id: id.toString() },
      updateUserDto,
      { new: true },
    );
  }

  async deleteUser(id: number) {
    return this.usersRepository.deleteOne({ _id: id.toString() });
  }
}
