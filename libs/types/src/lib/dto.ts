import {Types} from 'mongoose';

export type DTO<T> = {
  [P in keyof T]: T[P] extends Types.ObjectId ? string : T[P];
} & { _id: string };
