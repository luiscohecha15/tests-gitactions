import { Test, TestingModule } from '@nestjs/testing';
import { ToDoController } from './to-do.controller';
import { ToDoService } from './to-do.service';
import { Types } from 'mongoose';

describe('ToDoController', () => {
  let controller: ToDoController;
  let service: ToDoService;

  const mockTodo = {
    _id: new Types.ObjectId(),
    name: 'Test Task',
    description: 'Test Description',
    is_complete: false,
    user: new Types.ObjectId(),
  };

  const mockToDoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToDoController],
      providers: [
        {
          provide: ToDoService,
          useValue: mockToDoService,
        },
      ],
    }).compile();

    controller = module.get<ToDoController>(ToDoController);
    service = module.get<ToDoService>(ToDoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto = {
        name: 'New Task',
        description: 'Description',
        user: mockTodo.user.toString(),
      };

      mockToDoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      mockToDoService.findAll.mockResolvedValue([mockTodo]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTodo]);
    });
  });

  describe('findByUser', () => {
    it('should return todos for a specific user', async () => {
      const userId = mockTodo.user.toString();
      mockToDoService.findByUser.mockResolvedValue([mockTodo]);

      const result = await controller.findByUser(userId);

      expect(service.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockTodo]);
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      const todoId = mockTodo._id.toString();
      mockToDoService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(todoId);

      expect(service.findOne).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = mockTodo._id.toString();
      const updateDto = { name: 'Updated Task' };
      const updatedTodo = { ...mockTodo, ...updateDto };

      mockToDoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(todoId, updateDto);

      expect(service.update).toHaveBeenCalledWith(todoId, updateDto);
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const todoId = mockTodo._id.toString();
      mockToDoService.remove.mockResolvedValue(mockTodo);

      const result = await controller.remove(todoId);

      expect(service.remove).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });
});
