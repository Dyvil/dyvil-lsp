import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, PartialType} from '@nestjs/swagger';

@Schema()
export class User {
  @Prop()
  @ApiProperty()
  name: string;
}

export class CreateUserDto extends User {
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
}

export const UserSchema = SchemaFactory.createForClass(User);
