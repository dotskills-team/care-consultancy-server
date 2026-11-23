import express from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { changePasswordZodSchema, loginZodSchema } from "./auth.validation";

const router = express.Router();

router.post("/login", validateRequest(loginZodSchema), AuthControllers.login);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post(
  "/change-password",
  checkAuth(),
  validateRequest(changePasswordZodSchema),
  AuthControllers.changePassword,
);

export const authRoutes = router;
