import { z } from "zod";

export const loginZodSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordZodSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
