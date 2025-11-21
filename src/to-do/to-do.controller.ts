import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Delete,
} from '@nestjs/common';
import { ToDoService } from './to-do.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('to-do')
export class ToDoController {
	constructor(private readonly toDoService: ToDoService) {}

	@Post()
	create(@Body() dto: CreateTodoDto) {
		return this.toDoService.create(dto);
	}

	@Get()
	findAll() {
		return this.toDoService.findAll();
	}

	@Get('user/:userId')
	findByUser(@Param('userId') userId: string) {
		return this.toDoService.findByUser(userId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.toDoService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateTodoDto) {
		return this.toDoService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.toDoService.remove(id);
	}
}
