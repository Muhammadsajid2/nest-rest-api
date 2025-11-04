import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class PaymentManagement extends Document {
  @Prop({
    type: String,
    default: null,
  })
  tile: string;
}

export const PaymentManagementSchema =
  SchemaFactory.createForClass(PaymentManagement);
