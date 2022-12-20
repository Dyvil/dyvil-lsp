import {MapType} from '@angular/compiler';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, PartialType} from '@nestjs/swagger';
import {Document, Types} from 'mongoose';
import {DTO} from './dto';

@Schema()
export class User {
  @Prop()
  @ApiProperty()
  name!: string;
}

export class CreateUserDto extends User {
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
}

export type UserDocument = User & Document<Types.ObjectId, any, User>;

export type UserDto = DTO<User>;

export const UserSchema = SchemaFactory.createForClass(User);
