import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCurrentUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  age?: number;
}
