import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  is_complete?: boolean;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
