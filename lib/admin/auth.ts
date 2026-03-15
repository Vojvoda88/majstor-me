/**
 * Admin auth - provjera sesije i role.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { AdminRole } from "./permissions";
import { hasPermission, type Permission } from "./permissions";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");
  if (session.user?.role !== "ADMIN") redirect("/");

  const { prisma } = await import("@/lib/db");
  const adminProfile = await prisma.adminProfile.findUnique({
    where: { userId: session.user.id },
    select: { adminRole: true },
  });

  const adminRole = (adminProfile?.adminRole ?? "SUPER_ADMIN") as AdminRole;
  return { session, adminRole };
}

export async function requireAdminPermission(permission: Permission) {
  const { session, adminRole } = await requireAdmin();

  if (!hasPermission(adminRole, permission)) {
    redirect("/admin?error=forbidden");
  }

  return { session, adminRole };
}
