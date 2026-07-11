import { PartialType } from '@nestjs/mapped-types';
import { CreateKhataTransactionDto } from './create-khata-transaction.dto';

export class UpdateKhataTransactionDto extends PartialType(CreateKhataTransactionDto) {}
