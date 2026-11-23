import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RoleServices } from "./role.service";

const createRole = catchAsync(async (req: Request, res: Response) => {
  const data = await RoleServices.createRole(req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Role created successfully", data });
});

const getAllRoles = catchAsync(async (req: Request, res: Response) => {
  const result = await RoleServices.getAllRoles(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Roles retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleRole = catchAsync(async (req: Request, res: Response) => {
  const data = await RoleServices.getSingleRole(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Role retrieved successfully", data });
});

const getPermissions = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Permissions retrieved successfully",
    data: RoleServices.getPermissionRegistry(),
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const data = await RoleServices.updateRole(req.params.id as string, req.body, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Role updated successfully", data });
});

const deleteRole = catchAsync(async (req: Request, res: Response) => {
  const data = await RoleServices.deleteRole(req.params.id as string, req.user);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Role deleted successfully", data });
});

export const RoleControllers = { createRole, getAllRoles, getSingleRole, getPermissions, updateRole, deleteRole };
