import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('UsersService (Integration)', () => {
  let service: UsersService;
  let mongod: MongoMemoryServer | undefined;

  beforeAll(async () => {
    let uri: string;
    if (process.env.MONGO_URI) {
      uri = process.env.MONGO_URI;
    } else {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  it('should create a user', async () => {
    const user = await service.create({
      name: 'Luis',
      email: 'luis@mail.com',
    });

    expect(user).toHaveProperty('_id');
    expect(user.name).toBe('Luis');
  });

  it('should get all users', async () => {
    const users = await service.findAll();
    expect(Array.isArray(users)).toBe(true);
  });
});
