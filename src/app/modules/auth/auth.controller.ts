import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/appError";
import { clearAuthCookie, setAuthCookie } from "../../utils/setCookie";
import { AuthServices } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthServices.login(email, password);
  setAuthCookie(res, result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not received");
  }
  const result = await AuthServices.getNewAccessToken(refreshToken);
  setAuthCookie(res, result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New access token retrieved successfully",
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.changePassword(
    req.user.userId,
    req.body.oldPassword,
    req.body.newPassword,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

export const AuthControllers = { login, getNewAccessToken, logout, changePassword };
