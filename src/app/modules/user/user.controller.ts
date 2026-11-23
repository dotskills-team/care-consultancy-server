import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.createUser(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.getSingleUser(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.updateProfile(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.getSingleUser(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.updateUser(req.params.id as string, req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const data = await UserServices.deleteUser(req.params.id as string, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getMe,
  updateMe,
  getSingleUser,
  updateUser,
  deleteUser,
};
