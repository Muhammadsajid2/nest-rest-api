import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true })
export class Alert extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true })
  label: string;

  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
