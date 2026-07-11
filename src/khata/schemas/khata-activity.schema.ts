import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KhataActivityDocument = HydratedDocument<KhataActivity>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class KhataActivity {
  @Prop({ type: Types.ObjectId, ref: 'Khata', required: true, index: true })
  khataId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'KhataTransaction' })
  transactionId?: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ type: Object })
  previousValues?: Record<string, unknown>;

  @Prop({ type: Object })
  newValues?: Record<string, unknown>;
}

export const KhataActivitySchema = SchemaFactory.createForClass(KhataActivity);
