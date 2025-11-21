import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const rootMongooseTestModule = async () => {
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
