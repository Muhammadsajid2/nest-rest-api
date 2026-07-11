import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KhataTransactionDocument = HydratedDocument<KhataTransaction>;

@Schema({ _id: false })
export class SplitDetail {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant: Types.ObjectId;

  @Prop({ min: 0 })
  amount?: number;

  @Prop({ min: 0, max: 100 })
  percentage?: number;
}

@Schema({ _id: false })
export class TransactionAttachment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  type?: string;
}

@Schema({ timestamps: true })
export class KhataTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Khata', required: true, index: true })
  khataId: Types.ObjectId;

  @Prop({ enum: ['payment', 'expense', 'adjustment', 'settlement'], required: true })
  type: 'payment' | 'expense' | 'adjustment' | 'settlement';

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  paidBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  paidTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  expenseFor?: Types.ObjectId;

  @Prop({ enum: ['equal', 'full', 'custom'] })
  splitType?: 'equal' | 'full' | 'custom';

  @Prop({ type: [SplitDetail], default: [] })
  splitDetails?: SplitDetail[];

  @Prop()
  description?: string;

  @Prop({ required: true })
  transactionDate: Date;

  @Prop({ type: [TransactionAttachment], default: [] })
  attachments?: TransactionAttachment[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false })
  archived: boolean;
}

export const KhataTransactionSchema = SchemaFactory.createForClass(KhataTransaction);
KhataTransactionSchema.index({ khataId: 1, archived: 1, transactionDate: -1 });
