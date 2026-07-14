import { ArrayMaxSize, IsArray, IsEnum, IsMongoId, IsObject, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(1000)
  body: string;

  @IsEnum(['all', 'topic', 'devices'])
  targetType: 'all' | 'topic' | 'devices';

  @ValidateIf((value) => value.targetType === 'topic')
  @IsString()
  @MaxLength(900)
  topic?: string;

  @ValidateIf((value) => value.targetType === 'devices')
  @IsArray()
  @ArrayMaxSize(500)
  @IsMongoId({ each: true })
  deviceIds?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
