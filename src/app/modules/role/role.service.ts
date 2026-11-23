import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { User } from "../user/user.model";
import { ALL_PERMISSIONS, PERMISSION_REGISTRY, roleSearchableFields, SUPER_ADMIN_ROLE } from "./role.constants";
import { IAuthUser, IRole, Permission } from "./role.interface";
import { Role } from "./role.model";

export const isSuperAdminRole = (role: Pick<IRole, "name" | "isSystem">) =>
  role.isSystem && role.name === SUPER_ADMIN_ROLE;

// Non-super-admins may only deal with permission sets strictly smaller than their own,
// so nobody can create or assign a role equal to or more powerful than their own.
export const isStrictSubset = (subset: Permission[], superset: Permission[]) => {
  const set = new Set(superset);
  const sub = new Set(subset);
  return sub.size < set.size && [...sub].every((p) => set.has(p));
};

// May `requester` assign this role to a user, or manage a user / role that has it?
export const assertCanUseRole = (
  requester: IAuthUser,
  role: Pick<IRole, "name" | "isSystem" | "permissions">,
) => {
  if (isSuperAdminRole(role)) {
    throw new AppError(httpStatus.FORBIDDEN, "Super admin cannot be modified or assigned");
  }
  if (requester.isSuperAdmin) return;
  if (!isStrictSubset(role.permissions, requester.permissions)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only manage roles with fewer permissions than your own",
    );
  }
};

const assertCanGrant = (requester: IAuthUser, permissions: Permission[]) => {
  if (requester.isSuperAdmin) return;
  if (!isStrictSubset(permissions, requester.permissions)) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only grant fewer permissions than your own");
  }
};

const createRole = async (payload: Partial<IRole>, requester: IAuthUser) => {
  const permissions = [...new Set(payload.permissions ?? [])];
  assertCanGrant(requester, permissions);
  return Role.create({ ...payload, permissions, isSystem: false });
};

const getAllRoles = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(Role.find(), query)
    .filter()
    .search(roleSearchableFields)
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([qb.build(), qb.getMeta()]);
  return { data, meta };
};

const getSingleRole = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError(httpStatus.NOT_FOUND, "Role not found");
  return role;
};

const updateRole = async (id: string, payload: Partial<IRole>, requester: IAuthUser) => {
  const role = await getSingleRole(id);
  if (isSuperAdminRole(role)) {
    throw new AppError(httpStatus.FORBIDDEN, "Super admin role cannot be modified");
  }
  if (role.isSystem && payload.name && payload.name !== role.name) {
    throw new AppError(httpStatus.BAD_REQUEST, "System roles cannot be renamed");
  }
  if (!requester.isSuperAdmin) {
    if (role._id.toString() === requester.roleId) {
      throw new AppError(httpStatus.FORBIDDEN, "You cannot modify your own role");
    }
    assertCanUseRole(requester, role);
  }
  if (payload.permissions) {
    payload.permissions = [...new Set(payload.permissions)];
    assertCanGrant(requester, payload.permissions);
  }
  // Takes effect immediately: checkAuth reloads the role on every request
  return Role.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deleteRole = async (id: string, requester: IAuthUser) => {
  const role = await getSingleRole(id);
  if (role.isSystem) throw new AppError(httpStatus.BAD_REQUEST, "System roles cannot be deleted");
  if (!requester.isSuperAdmin) assertCanUseRole(requester, role);
  if (await User.exists({ role: role._id, isDeleted: false })) {
    throw new AppError(httpStatus.CONFLICT, "Role is assigned to users; reassign them first");
  }
  await Role.findByIdAndDelete(id);
  return role;
};

const getPermissionRegistry = () => ({
  permissions: ALL_PERMISSIONS,
  grouped: PERMISSION_REGISTRY,
});

export const RoleServices = {
  createRole,
  getAllRoles,
  getSingleRole,
  updateRole,
  deleteRole,
  getPermissionRegistry,
};
