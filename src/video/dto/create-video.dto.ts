import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  subCategory: string[];

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
  @IsBoolean()
  highlights?: boolean;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
