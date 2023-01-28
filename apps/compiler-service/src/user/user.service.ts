import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {CreateUserDto, UpdateUserDto, User, UserDocument} from '@stc/types';
import {Model} from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private model: Model<User>,
  ) {
  }

  create(dto: CreateUserDto): Promise<User> {
    return this.model.create(dto);
  }

  findAll(): Promise<UserDocument[]> {
    return this.model.find().exec();
  }

  findOne(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  remove(id: string): Promise<UserDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
