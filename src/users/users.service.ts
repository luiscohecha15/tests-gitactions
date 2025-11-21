import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    return this.userModel.find().exec();
  }

  async create(data: any) {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async remove(id: string) {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User not found');
    return res;
  }
}
