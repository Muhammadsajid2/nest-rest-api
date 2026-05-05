import { IsNotEmpty, IsOptional, IsString, IsMongoId, IsArray } from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @IsMongoId()
  subCategory: string;

  @IsNotEmpty()
  @IsString()
  img: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  url: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  highlights?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
