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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateCurrentUserDto, UpdateUserDto } from './dto';
import { CurrentUser, IPaginationQueryParams, PaginationQueryParams } from 'src/decorators';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.getCurrentUser(user._id || user.id);
  }

  @Patch('me')
  updateCurrentUser(
    @CurrentUser() user: any,
    @Body(ValidationPipe) updatedUser: UpdateCurrentUserDto,
  ) {
    return this.usersService.updateCurrentUser(user._id || user.id, updatedUser);
  }

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
