import { Test, TestingModule } from '@nestjs/testing';
import { ToDoService } from './to-do.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Todo } from './schemas/todo.schema';
import { User } from '../users/schemas/user.schema';

describe('ToDoService', () => {
  let service: ToDoService;
  let mockTodoModel: any;
  let mockUserModel: any;

  const mockTodo = {
    _id: new Types.ObjectId(),
    name: 'Test Task',
    description: 'Test Description',
    is_complete: false,
    user: new Types.ObjectId(),
  };

  const mockUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockTodoModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockUserModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToDoService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<ToDoService>(ToDoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return todos for a specific user converted to ObjectId', async () => {
      const userId = mockUser._id.toString();
      mockTodoModel.exec.mockResolvedValue([mockTodo]);

      const result = await service.findByUser(userId);

      expect(mockTodoModel.find).toHaveBeenCalledWith({
        user: expect.any(Types.ObjectId),
      });
      expect(mockTodoModel.populate).toHaveBeenCalledWith('user', 'name email');
      expect(result).toEqual([mockTodo]);
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      mockTodoModel.exec.mockResolvedValue([mockTodo]);

      const result = await service.findAll();

      expect(mockTodoModel.find).toHaveBeenCalled();
      expect(mockTodoModel.populate).toHaveBeenCalledWith('user', 'name email');
      expect(result).toEqual([mockTodo]);
    });
  });

  describe('findOne', () => {
    it('should return a single todo by id', async () => {
      const todoId = mockTodo._id.toString();
      mockTodoModel.exec.mockResolvedValue(mockTodo);

      const result = await service.findOne(todoId);

      expect(mockTodoModel.findById).toHaveBeenCalledWith(todoId);
      expect(mockTodoModel.populate).toHaveBeenCalledWith('user', 'name email');
      expect(result).toEqual(mockTodo);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const createDto = {
        name: 'New Task',
        description: 'Task Description',
        user: 'invalid-id',
      };

      mockUserModel.exec.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserModel.findById).toHaveBeenCalledWith(createDto.user);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when updating with invalid user', async () => {
      const todoId = mockTodo._id.toString();
      const updateDto = { user: 'invalid-user-id' };

      mockUserModel.exec.mockResolvedValue(null);

      await expect(service.update(todoId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update a todo when user is valid', async () => {
      const todoId = mockTodo._id.toString();
      const updateDto = { name: 'Updated Task' };

      mockTodoModel.exec.mockResolvedValue({ ...mockTodo, ...updateDto });

      const result = await service.update(todoId, updateDto);

      expect(mockTodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        todoId,
        updateDto,
        { new: true },
      );
      expect(result).toEqual({ ...mockTodo, ...updateDto });
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const todoId = mockTodo._id.toString();
      mockTodoModel.exec.mockResolvedValue(mockTodo);

      const result = await service.remove(todoId);

      expect(mockTodoModel.findByIdAndDelete).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });
});
