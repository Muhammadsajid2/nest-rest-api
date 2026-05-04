import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  img: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
