import { Permission } from "./role.interface";

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

const crud = ["read", "create", "update", "delete"] as const;

// Permission registry: `resource:action`. Add new resources/actions here when a module is added.
export const PERMISSION_REGISTRY: Record<string, readonly string[]> = {
  user: crud,
  role: crud,
  country: crud,
  university: crud,
  program: crud,
  scholarship: crud,
  service: crud,
  article: crud,
  faq: crud,
  testimonial: crud,
  teamMember: crud,
  partner: crud,
  download: crud,
  intakeEvent: crud,
  page: crud,
  setting: ["read", "update"],
  inquiry: ["read", "update", "assign", "export", "delete"],
  dashboard: ["read"],
};

export const ALL_PERMISSIONS: Permission[] = Object.entries(PERMISSION_REGISTRY).flatMap(
  ([resource, actions]) => actions.map((a) => `${resource}:${a}`),
);

const contentResources = [
  "country", "university", "program", "scholarship", "service", "article", "faq",
  "testimonial", "teamMember", "partner", "download", "intakeEvent", "page",
];

// Roles created at startup. SUPER_ADMIN is always synced to every permission;
// the others are only created if missing, so edits made through the API are kept.
export const SYSTEM_ROLES: { name: string; description: string; permissions: Permission[] }[] = [
  { name: SUPER_ADMIN_ROLE, description: "Full access", permissions: ALL_PERMISSIONS },
  { name: "ADMIN", description: "Manages users, roles and content", permissions: ALL_PERMISSIONS },
  {
    name: "EDITOR",
    description: "Manages website content",
    permissions: [
      ...contentResources.flatMap((r) => crud.map((a) => `${r}:${a}`)),
      "setting:read",
    ],
  },
  {
    name: "COUNSELLOR",
    description: "Handles inquiries",
    permissions: ["inquiry:read", "inquiry:update", "dashboard:read"],
  },
];

export const roleSearchableFields = ["name", "description"];
