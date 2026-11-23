import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { RoleControllers } from "./role.controller";
import { createRoleZodSchema, updateRoleZodSchema } from "./role.validation";

const router = express.Router();

router.get("/permissions", checkAuth("role:read"), RoleControllers.getPermissions);
router.post("/", checkAuth("role:create"), validateRequest(createRoleZodSchema), RoleControllers.createRole);
router.get("/", checkAuth("role:read"), RoleControllers.getAllRoles);
router.get("/:id", checkAuth("role:read"), RoleControllers.getSingleRole);
router.patch("/:id", checkAuth("role:update"), validateRequest(updateRoleZodSchema), RoleControllers.updateRole);
router.delete("/:id", checkAuth("role:delete"), RoleControllers.deleteRole);

export const roleRoutes = router;
