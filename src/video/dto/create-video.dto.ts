import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { VideoLinkType } from '../constants/link-type.enum';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  category: string[];

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  subCategory: string[];

  @IsNotEmpty()
  @IsString()
  img: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  url?: string[];

  @IsOptional()
  @IsEnum(VideoLinkType, { message: 'linkType must be either mpd or m3u8' })
  linkType?: VideoLinkType;

  // Required only for MPD links.
  @ValidateIf((o) => o.linkType === VideoLinkType.MPD)
  @IsNotEmpty({ message: 'clearKey1 is required when linkType is mpd' })
  @IsString()
  clearKey1?: string | null;

  @ValidateIf((o) => o.linkType === VideoLinkType.MPD)
  @IsNotEmpty({ message: 'clearKey2 is required when linkType is mpd' })
  @IsString()
  clearKey2?: string | null;

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
