/**
 * Admin API auth - provjera sesije i permisija za API rute.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getRequestClientIp } from "@/lib/request-ip";
import { getRetryAfterSeconds, isRateLimited } from "@/lib/rate-limit";
import { hasPermission, type AdminRole, type Permission } from "./permissions";

const ADMIN_WRITE_LIMIT = 120;
const ADMIN_WRITE_WINDOW_MS = 60 * 60 * 1000;
type AdminAuthResult =
  | { ok: true; session: { user: { id: string; name?: string | null } }; adminRole: AdminRole }
  | { ok: false; response: NextResponse }
;

export async function requireAdminApi(permission: Permission, request?: Request): Promise<AdminAuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ success: false, error: "Niste prijavljeni" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false, response: NextResponse.json({ success: false, error: "Nemate pristup" }, { status: 403 }) };
  }

  let adminRole: AdminRole;
  try {
    const { prisma } = await import("@/lib/db");
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
      select: { adminRole: true },
    });
    adminRole = (adminProfile?.adminRole ?? "SUPER_ADMIN") as AdminRole;
  } catch (e) {
    console.error("[requireAdminApi] prisma adminProfile failed", e);
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Greška pri provjeri admin profila.", code: "ADMIN_PROFILE_DB" },
        { status: 500 }
      ),
    };
  }

  if (!hasPermission(adminRole, permission)) {
    return { ok: false, response: NextResponse.json({ success: false, error: "Nemate dozvolu" }, { status: 403 }) };
  }

  if (request) {
    const method = request.method.toUpperCase();
    if (method !== "POST" && method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
      return { ok: true, session: session as { user: { id: string; name?: string | null } }, adminRole };
    }
    const ip = getRequestClientIp(request);
    const limiterKey = `admin-write:${session.user.id}:${ip}:${permission}`;
    if (isRateLimited(limiterKey, ADMIN_WRITE_LIMIT, ADMIN_WRITE_WINDOW_MS)) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Previše admin izmjena. Pokušajte ponovo malo kasnije." },
          { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(limiterKey)) } }
        ),
      };
    }
  }

  return { ok: true, session: session as { user: { id: string; name?: string | null } }, adminRole };
}
