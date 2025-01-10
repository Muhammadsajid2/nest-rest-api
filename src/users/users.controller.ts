import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: 'ADMIN' | 'INTERN') {
    return this.usersService.findAll(role);
  }

  @Get('interns')
  findAllInterns() {
    return this.usersService.findAllInterns();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    user: {
      name: string;
      age: number;
      role: 'ADMIN' | 'INTERN';
      email: string;
    },
  ) {
    return this.usersService.create(user);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updatedUser: Partial<{
      name: string;
      age: number;
      role: 'ADMIN' | 'INTERN';
      email: string;
    }>,
  ) {
    return this.usersService.updateUser(id, updatedUser);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
