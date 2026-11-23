import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/appError";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IRole, Permission } from "../modules/role/role.interface";
import { isSuperAdminRole } from "../modules/role/role.service";
import { verifyToken } from "../utils/jwt";

// checkAuth()             -> any authenticated, active user
// checkAuth("a:b", "c:d") -> user whose role has at least one of the listed permissions
export const checkAuth =
  (...permissions: Permission[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const accessToken = header?.replace(/^Bearer\s+/i, "") || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Token not received");
      }

      const verified = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

      const user = await User.findById(verified.userId).populate<{ role: IRole | null }>("role");
      if (!user || user.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
      }
      if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "User is inactive");
      }

      // Role and permissions come from the DB on every request, so changes apply immediately
      const role = user.role;
      if (!role) {
        throw new AppError(httpStatus.FORBIDDEN, "User has no valid role");
      }
      const isSuperAdmin = isSuperAdminRole(role);

      if (
        !isSuperAdmin &&
        permissions.length &&
        !permissions.some((p) => role.permissions.includes(p))
      ) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to access this route");
      }

      req.user = {
        userId: user._id.toString(),
        email: user.email,
        role: role.name,
        roleId: role._id!.toString(),
        permissions: role.permissions,
        isSuperAdmin,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
