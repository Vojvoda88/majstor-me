/**
 * Admin API auth - provjera sesije i permisija za API rute.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission, type AdminRole, type Permission } from "./permissions";

export async function requireAdminApi(permission: Permission): Promise<
  | { ok: true; session: { user: { id: string; name?: string | null } }; adminRole: AdminRole }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ success: false, error: "Niste prijavljeni" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false, response: NextResponse.json({ success: false, error: "Nemate pristup" }, { status: 403 }) };
  }

  const { prisma } = await import("@/lib/db");
  const adminProfile = await prisma.adminProfile.findUnique({
    where: { userId: session.user.id },
    select: { adminRole: true },
  });

  const adminRole = (adminProfile?.adminRole ?? "SUPER_ADMIN") as AdminRole;

  if (!hasPermission(adminRole, permission)) {
    return { ok: false, response: NextResponse.json({ success: false, error: "Nemate dozvolu" }, { status: 403 }) };
  }

  return { ok: true, session: session as { user: { id: string; name?: string | null } }, adminRole };
}
