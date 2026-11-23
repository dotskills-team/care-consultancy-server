import { Types } from "mongoose";

export type Permission = string; // "resource:action", see PERMISSION_REGISTRY

export interface IRole {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

// Shape of req.user, built in checkAuth from the DB (never from the token)
export interface IAuthUser {
  userId: string;
  email: string;
  role: string;
  roleId: string;
  permissions: Permission[];
  isSuperAdmin: boolean;
}
