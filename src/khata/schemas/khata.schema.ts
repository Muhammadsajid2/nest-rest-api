import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KhataDocument = HydratedDocument<Khata>;

@Schema({ _id: false })
export class KhataParticipant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;
}

export const KhataParticipantSchema = SchemaFactory.createForClass(KhataParticipant);

@Schema({ timestamps: true })
export class Khata {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [KhataParticipantSchema], required: true, validate: [(value: KhataParticipant[]) => value.length === 2, 'A Khata must have exactly two participants'] })
  participants: KhataParticipant[];

  @Prop({ required: true, default: 'PKR', uppercase: true })
  currency: string;

  @Prop({ enum: ['active', 'settled', 'archived'], default: 'active' })
  status: 'active' | 'settled' | 'archived';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  archived: boolean;
}

export const KhataSchema = SchemaFactory.createForClass(Khata);
KhataSchema.index({ 'participants.userId': 1, archived: 1, updatedAt: -1 });
