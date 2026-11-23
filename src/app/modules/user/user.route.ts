import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  createUserZodSchema,
  updateProfileZodSchema,
  updateUserZodSchema,
} from "./user.validation";

const router = express.Router();

router.get("/me", checkAuth(), UserControllers.getMe);
router.patch("/me", checkAuth(), validateRequest(updateProfileZodSchema), UserControllers.updateMe);

// User management is permission-gated; which roles a requester may assign or manage
// is enforced in the service (assertCanUseRole).
router.post("/", checkAuth("user:create"), validateRequest(createUserZodSchema), UserControllers.createUser);
router.get("/", checkAuth("user:read"), UserControllers.getAllUsers);
router.get("/:id", checkAuth("user:read"), UserControllers.getSingleUser);
router.patch("/:id", checkAuth("user:update"), validateRequest(updateUserZodSchema), UserControllers.updateUser);
router.delete("/:id", checkAuth("user:delete"), UserControllers.deleteUser);

export const userRoutes = router;
