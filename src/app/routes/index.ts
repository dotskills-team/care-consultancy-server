import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { roleRoutes } from "../modules/role/role.route";
import { userRoutes } from "../modules/user/user.route";

export const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/user", route: userRoutes },
  { path: "/role", route: roleRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
