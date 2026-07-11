import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from '../../category/schemas/category.schema';

export type SubCategoryDocument = SubCategory & Document;

@Schema({ timestamps: true })
export class SubCategory extends Document {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Category.name }],
    ref: Category.name,
    required: true,
  })
  category: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  img: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
