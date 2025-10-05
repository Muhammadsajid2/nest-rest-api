import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';
import { IPaginationQueryParams } from 'src/decorators';
import { stringToObject } from 'src/util/string-to-object.util';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(paginationQueryParams: IPaginationQueryParams): Promise<any> {
    const { limit, offset, sort, filter, populate, populateSelect } =
      paginationQueryParams;
    const whereFilter = {
      ...filter,
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
