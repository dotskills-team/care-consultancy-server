import bcrypt from "bcryptjs";
import { envVars } from "../config/env";
import { SUPER_ADMIN_ROLE, SYSTEM_ROLES } from "../modules/role/role.constants";
import { Role } from "../modules/role/role.model";
import { User } from "../modules/user/user.model";

// Creates the system roles, keeps SUPER_ADMIN synced to every permission, and migrates
// users that still store the old string role (e.g. "ADMIN") to a Role reference.
const seedRoles = async () => {
  for (const def of SYSTEM_ROLES) {
    let role = await Role.findOne({ name: def.name, isSystem: true });
    if (!role) {
      role = await Role.create({ ...def, isSystem: true });
    } else if (def.name === SUPER_ADMIN_ROLE) {
      role.permissions = def.permissions;
      await role.save();
    }
    await User.collection.updateMany({ role: def.name as never }, { $set: { role: role._id } });
  }
};

export const seedAdmin = async () => {
  try {
    await seedRoles();
    const superAdminRole = await Role.findOne({ name: SUPER_ADMIN_ROLE, isSystem: true });
    if (!superAdminRole) throw new Error("Super admin role missing");

    if (await User.exists({ role: superAdminRole._id })) {
      console.log("Super admin already exists");
      return;
    }

    const password = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASS,
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    const admin = await User.create({
      name: "Super Admin",
      email: envVars.SUPER_ADMIN_EMAIL,
      password,
      role: superAdminRole._id,
    });

    console.log(`Default super admin created: ${admin.email}`);
  } catch (error) {
    console.error("Failed to seed super admin:", error);
  }
};
