import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(
    signupDto: SignupDto,
  ): Promise<{ token: string; statusCode: number; message: string }> {
    const { name, email, password } = signupDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }],
    });
    if (existingUser) {
      throw new ConflictException('Email or phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.jwtService.sign({ id: user._id });

    return {
      statusCode: 200,
      message: 'User created successfully',
      token: token,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; statusCode: number; message: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ id: user._id });

    return {
      statusCode: 200,
      message: 'User logged in successfully',
      token: token,
    };
  }
}
