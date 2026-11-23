import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";

const buildPayload = (user: Partial<IUser>) => ({
  userId: user._id,
  email: user.email,
});

export const createUserTokens = (user: Partial<IUser>) => {
  const payload = buildPayload(user);
  return {
    accessToken: generateToken(payload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES),
    refreshToken: generateToken(payload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES),
  };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const verified = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;
  const user = await User.findById(verified.userId);

  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not available");
  }

  return generateToken(buildPayload(user), envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
};
