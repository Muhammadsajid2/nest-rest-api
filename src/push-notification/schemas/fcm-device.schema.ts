import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FcmDeviceDocument = FcmDevice & Document;

@Schema({ timestamps: true })
export class FcmDevice extends Document {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true, enum: ['android', 'ios', 'web'] })
  platform: 'android' | 'ios' | 'web';

  @Prop()
  deviceName?: string;

  @Prop()
  appVersion?: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: Date.now })
  lastSeenAt: Date;
}

export const FcmDeviceSchema = SchemaFactory.createForClass(FcmDevice);
FcmDeviceSchema.index({ enabled: 1, lastSeenAt: -1 });
