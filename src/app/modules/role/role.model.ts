import { model, Schema } from "mongoose";
import { IRole } from "./role.interface";

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// Case-insensitive unique name
roleSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Role = model<IRole>("Role", roleSchema);
