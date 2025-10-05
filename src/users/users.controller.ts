import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IPaginationQueryParams, PaginationQueryParams } from 'src/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  findAll(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.usersService.findAll(paginationQueryParams);
  }

  @Get('interns')
  findAllInterns() {
    return this.usersService.findAllInterns();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Post()
  create(
    @Body(ValidationPipe)
    user: CreateUserDto,
  ) {
    return this.usersService.createNewUser(user);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updatedUser: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updatedUser);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
