/**
 * Admin role i permission sistem.
 * SUPER_ADMIN ima sve. READ_ONLY samo pregled.
 * Ostale role imaju dio sistema.
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "MODERATION_ADMIN"
  | "FINANCE_ADMIN"
  | "SUPPORT_ADMIN"
  | "READ_ONLY";

export const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "MODERATION_ADMIN",
  "FINANCE_ADMIN",
  "SUPPORT_ADMIN",
  "READ_ONLY",
];

export type Permission =
  | "dashboard"
  | "moderation"
  | "workers"
  | "users"
  | "requests"
  | "offers"
  | "credits"
  | "payments"
  | "chat"
  | "categories"
  | "cities"
  | "notifications"
  | "trust_safety"
  | "content"
  | "settings"
  | "audit_log"
  | "workers_write"
  | "users_write"
  | "requests_write"
  | "offers_write"
  | "credits_write"
  | "moderation_write"
  | "settings_write";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard",
    "moderation",
    "workers",
    "users",
    "requests",
    "offers",
    "credits",
    "payments",
    "chat",
    "categories",
    "cities",
    "notifications",
    "trust_safety",
    "content",
    "settings",
    "audit_log",
    "workers_write",
    "users_write",
    "requests_write",
    "offers_write",
    "credits_write",
    "moderation_write",
    "settings_write",
  ],
  READ_ONLY: [
    "dashboard",
    "moderation",
    "workers",
    "users",
    "requests",
    "offers",
    "credits",
    "payments",
    "chat",
    "categories",
    "cities",
    "notifications",
    "trust_safety",
    "content",
    "settings",
    "audit_log",
  ],
  OPERATIONS_ADMIN: [
    "dashboard",
    "workers",
    "users",
    "requests",
    "offers",
    "chat",
    "categories",
    "cities",
    "workers_write",
    "users_write",
    "requests_write",
    "offers_write",
  ],
  MODERATION_ADMIN: [
    "dashboard",
    "moderation",
    "users",
    "requests",
    "chat",
    "trust_safety",
    "moderation_write",
  ],
  FINANCE_ADMIN: [
    "dashboard",
    "credits",
    "payments",
    "credits_write",
  ],
  SUPPORT_ADMIN: [
    "dashboard",
    "users",
    "requests",
    "chat",
    "users_write",
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canWrite(role: AdminRole, section: Permission): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (role === "READ_ONLY") return false;
  const writePerm = `${section.replace("_write", "")}_write` as Permission;
  return hasPermission(role, writePerm) || hasPermission(role, section);
}

export function getAdminRole(userRole: string | null, adminProfileRole: AdminRole | null): AdminRole {
  if (adminProfileRole) return adminProfileRole;
  return userRole === "ADMIN" ? "SUPER_ADMIN" : "READ_ONLY";
}
