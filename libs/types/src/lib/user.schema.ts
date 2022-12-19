import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';

@Schema()
export class User {
  @Prop()
  @ApiProperty()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
