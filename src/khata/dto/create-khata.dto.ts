import { IsEnum, IsInt, IsMongoId, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateKhataDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  secondParticipantId: string;

  @IsString()
  currency: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  openingBalance?: number;

  @IsOptional()
  @IsEnum(['creatorOwesParticipant', 'participantOwesCreator'])
  openingBalanceDirection?: 'creatorOwesParticipant' | 'participantOwesCreator';
}
