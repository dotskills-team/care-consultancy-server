import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/appError";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { userSearchableFields } from "./user.constants";
import { IAuthUser } from "../role/role.interface";
import { Role } from "../role/role.model";
import { assertCanUseRole } from "../role/role.service";

// Super admin accounts can never be changed here; other requesters may only handle users
// whose role has strictly fewer permissions than their own (see assertCanUseRole).
const assertCanManageRoleId = async (requester: IAuthUser, roleId?: unknown) => {
  if (!roleId) return;
  const role = await Role.findById(roleId);
  if (!role) throw new AppError(httpStatus.NOT_FOUND, "Role not found");
  assertCanUseRole(requester, role);
};

const createUser = async (payload: Partial<IUser>, requester: IAuthUser) => {
  await assertCanManageRoleId(requester, payload.role);
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
  }

  const password = await bcryptjs.hash(
    payload.password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const user = await User.create({ ...payload, password });
  const { password: _, ...rest } = user.toObject();
  return rest;
};

const rolePopulate = { path: "role", select: "name permissions isSystem" };

const getAllUsers = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(User.find({ isDeleted: false }).populate(rolePopulate), query)
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([qb.build(), qb.getMeta()]);
  return { data, meta };
};

const getSingleUser = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false }).populate(rolePopulate);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const updateProfile = async (id: string, payload: Pick<IUser, "name">) => {
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { name: payload.name },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  requester: IAuthUser,
) => {
  const target = await User.findOne({ _id: id, isDeleted: false });
  if (!target) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (target._id.toString() !== requester.userId) {
    await assertCanManageRoleId(requester, target.role);
  } else if (payload.role || payload.isActive === false) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own role or deactivate yourself");
  }
  await assertCanManageRoleId(requester, payload.role);
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const deleteUser = async (id: string, requester: IAuthUser) => {
  if (id === requester.userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete yourself");
  }
  const target = await User.findOne({ _id: id, isDeleted: false });
  if (!target) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  await assertCanManageRoleId(requester, target.role);
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateProfile,
  deleteUser,
};
