import { z } from "zod";

const roleId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role id");

export const createUserZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: roleId,
});

export const updateUserZodSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: roleId.optional(),
  isActive: z.boolean().optional(),
});

export const updateProfileZodSchema = z.object({
  name: z.string().min(2).optional(),
});
