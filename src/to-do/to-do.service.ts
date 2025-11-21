
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ToDoService {
	constructor(
		@InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}

	async create(dto: CreateTodoDto) {
		
		const user = await this.userModel.findById(dto.user).exec();
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const created = new this.todoModel({
			name: dto.name,
			description: dto.description,
			is_complete: dto.is_complete,
			user: new Types.ObjectId(dto.user),
		});
		return created.save();
	}

	async findAll() {
		return this.todoModel.find().populate('user', 'name email').exec();
	}

	async findByUser(userId: string) {
		return this.todoModel.find({ user: new Types.ObjectId(userId) }).populate('user', 'name email').exec();
	}

	async findOne(id: string) {
		return this.todoModel.findById(id).populate('user', 'name email').exec();
	}

	async update(id: string, dto: UpdateTodoDto) {
		if (dto.user) {
			const user = await this.userModel.findById(dto.user).exec();
			if (!user) throw new NotFoundException('Usuario no encontrado');
		}
		return this.todoModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

	async remove(id: string) {
		return this.todoModel.findByIdAndDelete(id).exec();
	}
}

