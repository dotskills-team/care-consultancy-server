import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/appError";
import { envVars } from "../../config/env";
import { User } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";

const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  // Same message for unknown email and wrong password
  if (!user || !(await bcryptjs.compare(password, user.password as string))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }
  if (!user.isActive || user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not active");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = createUserTokens(user);
  const { password: _, ...rest } = user.toObject();
  return { ...tokens, user: rest };
};

const getNewAccessToken = async (refreshToken: string) => {
  return { accessToken: await createNewAccessTokenWithRefreshToken(refreshToken) };
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!(await bcryptjs.compare(oldPassword, user.password as string))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
  }

  user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
  await user.save();
};

export const AuthServices = { login, getNewAccessToken, changePassword };
