import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const rootMongooseTestModule = async () => {
  // If a MONGO_URI is provided (e.g. in CI with a real Mongo container), use it.
  if (process.env.MONGO_URI) {
    return {
      module: class RootMongooseTestModule {},
      imports: [MongooseModule.forRoot(process.env.MONGO_URI)],
      providers: [],
      exports: [],
    };
  }

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  return {
    module: class RootMongooseTestModule {},
    imports: [MongooseModule.forRoot(uri)],
    providers: [
      {
        provide: 'MONGO_IN_MEMORY',
        useValue: mongod,
      },
    ],
    exports: ['MONGO_IN_MEMORY'],
  };
};
