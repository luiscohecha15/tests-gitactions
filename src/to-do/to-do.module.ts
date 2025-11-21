import { Module } from '@nestjs/common';
import { ToDoService } from './to-do.service';
import { ToDoController } from './to-do.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ToDoService],
  controllers: [ToDoController],
})
export class ToDoModule {}
