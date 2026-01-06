import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class PaymentManagement extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: String,
    enum: ['debit', 'credit'],
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    default: null,
  })
  category: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  transactionDate: Date;

  @Prop({
    type: String,
    default: null,
  })
  reference: string;
}

export const PaymentManagementSchema =
  SchemaFactory.createForClass(PaymentManagement);
