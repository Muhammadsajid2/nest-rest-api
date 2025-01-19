import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(role?: 'ADMIN' | 'INTERN') {
    if (role) {
      return this.userModel.find({ role }).exec();
    }
    return this.userModel.find().exec();
  }

  async findAllInterns() {
    return this.userModel.find({ role: 'INTERN' }).exec();
  }

  async findOne(id: number) {
    return this.userModel.findById(id).exec();
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Check if user with email already exists
      const existingUser = await this.userModel
        .findOne({ email: createUserDto.email })
        .exec();
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async deleteUser(id: number) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
