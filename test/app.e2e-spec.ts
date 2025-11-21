import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Users & ToDo E2E (with MongoMemoryServer)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer | undefined;
  let userId: string;
  let todoId: string;

  beforeAll(async () => {
    // Si MONGO_URI está definido (ej. en CI con un contenedor MongoDB), úsalo.
    let uri: string;
    if (process.env.MONGO_URI) {
      uri = process.env.MONGO_URI;
    } else {
      // Crear Mongo en memoria
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      // Sobrescribir conexión de Mongoose
      process.env.MONGO_URI = uri;
    }

    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule, // Usa tu app pero redirigida al mongo en memoria
      ],
    })
      .overrideProvider('MONGO_URI')
      .useValue(uri)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    await app.close();
  });

  // Users Tests
  describe('Users', () => {
    it('/users (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User For ToDo',
          email: `test-${Date.now()}@mail.com`,
        })
        .expect(201);

      userId = response.body._id;
      expect(userId).toBeDefined();
    });

    it('/users (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/users/:id (DELETE)', async () => {
      // Create another user to delete
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Delete Test User',
          email: `delete-test-${Date.now()}@mail.com`,
        });

      const deleteUserId = createRes.body._id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/users/${deleteUserId}`)
        .expect(200);

      expect(deleteRes.body._id).toBe(deleteUserId);
    });
  });

  // ToDo Tests
  describe('ToDo', () => {
    it('/to-do (POST) - create todo', async () => {
      const response = await request(app.getHttpServer())
        .post('/to-do')
        .send({
          name: 'Test Task',
          description: 'Test Description',
          user: userId,
          is_complete: false,
        })
        .expect(201);

      todoId = response.body._id;
      expect(response.body.name).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.is_complete).toBe(false);
    });

    it('/to-do (GET) - list all todos', async () => {
      const response = await request(app.getHttpServer())
        .get('/to-do')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/to-do/user/:userId (GET) - list todos by user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/to-do/user/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].user._id).toBe(userId);
    });

    it('/to-do/:id (GET) - get single todo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/to-do/${todoId}`)
        .expect(200);

      expect(response.body._id).toBe(todoId);
      expect(response.body.name).toBe('Test Task');
    });

    it('/to-do/:id (PATCH) - update todo', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/to-do/${todoId}`)
        .send({
          name: 'Updated Task',
          is_complete: true,
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Task');
      expect(response.body.is_complete).toBe(true);
    });

    it('/to-do/:id (DELETE) - delete todo', async () => {
      const deleteRes = await request(app.getHttpServer())
        .delete(`/to-do/${todoId}`)
        .expect(200);

      expect(deleteRes.body._id).toBe(todoId);
    });

    it('/to-do (POST) - should fail with non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/to-do')
        .send({
          name: 'Task with invalid user',
          description: 'Description',
          user: '507f1f77bcf86cd799439011', 
          is_complete: false,
        })
        .expect(404);

      expect(response.body.message).toContain('Usuario no encontrado');
    });
  });
});
