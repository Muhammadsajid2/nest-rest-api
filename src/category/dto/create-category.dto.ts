import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
