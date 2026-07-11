import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class SplitDetailDto {
  @IsMongoId()
  participant: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number;
}

export class AttachmentDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateKhataTransactionDto {
  @IsEnum(['payment', 'expense', 'adjustment', 'settlement'])
  type: 'payment' | 'expense' | 'adjustment' | 'settlement';

  @IsInt()
  @Min(1)
  amount: number;

  @IsMongoId()
  paidBy: string;

  @IsOptional()
  @IsMongoId()
  paidTo?: string;

  @IsOptional()
  @IsMongoId()
  expenseFor?: string;

  @IsOptional()
  @IsEnum(['equal', 'full', 'custom'])
  splitType?: 'equal' | 'full' | 'custom';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => SplitDetailDto)
  splitDetails?: SplitDetailDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
