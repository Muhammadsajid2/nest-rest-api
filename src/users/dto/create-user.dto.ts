import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  phone: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber()
  @IsOptional()
  age?: number;
}
