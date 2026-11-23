import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: Types.ObjectId; // ref Role
  isActive: boolean;
  isDeleted: boolean;
  lastLoginAt?: Date;
}
