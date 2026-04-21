/**
 * Admin auth - provjera sesije i role.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AdminRole } from "./permissions";
import { hasPermission, type Permission } from "./permissions";

const getAdminRoleByUserId = cache(async (userId: string): Promise<AdminRole> => {
  const { prisma } = await import("@/lib/db");
  const adminProfile = await prisma.adminProfile.findUnique({
    where: { userId },
    select: { adminRole: true },
  });
  return (adminProfile?.adminRole ?? "SUPER_ADMIN") as AdminRole;
});

export async function requireAdmin() {
  const session = await auth();
  // Gost ide na čistu login stranicu bez callbackUrl,
  // admin panel otvara ručno nakon prijave.
  if (!session?.user?.id) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/");

  const adminRole = await getAdminRoleByUserId(session.user.id);
  return { session, adminRole };
}

export async function requireAdminPermission(permission: Permission) {
  const { session, adminRole } = await requireAdmin();

  if (!hasPermission(adminRole, permission)) {
    redirect("/admin?error=forbidden");
  }

  return { session, adminRole };
}
