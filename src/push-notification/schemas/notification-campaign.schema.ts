import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationCampaignDocument = NotificationCampaign & Document;

@Schema({ timestamps: true })
export class NotificationCampaign extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ enum: ['all', 'topic', 'devices'], required: true })
  targetType: 'all' | 'topic' | 'devices';

  @Prop()
  topic?: string;

  @Prop({ type: Object })
  data?: Record<string, string>;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  targetedDeviceCount: number;

  @Prop({ default: 0 })
  sentCount: number;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const NotificationCampaignSchema = SchemaFactory.createForClass(NotificationCampaign);
