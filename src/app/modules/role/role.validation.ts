import { z } from "zod";
import { ALL_PERMISSIONS } from "./role.constants";

const permissionSchema = z.enum(ALL_PERMISSIONS as [string, ...string[]]);

export const createRoleZodSchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(200).optional(),
  permissions: z.array(permissionSchema).default([]),
});

export const updateRoleZodSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
  permissions: z.array(permissionSchema).optional(),
});
