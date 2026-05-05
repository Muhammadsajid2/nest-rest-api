import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from '../../category/schemas/category.schema';
import { SubCategory } from '../../sub-category/schemas/sub-category.schema';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true })
  label: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: SubCategory.name,
    required: true,
  })
  subCategory: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  img: string;

  @Prop({ type: [String], required: true })
  url: string[];

  @Prop()
  description: string;

  @Prop({ type: Boolean, default: false })
  highlights: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
