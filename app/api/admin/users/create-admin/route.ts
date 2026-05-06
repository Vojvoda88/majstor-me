import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_STAFF_ROLES = [
  "OPERATIONS_ADMIN",
  "MODERATION_ADMIN",
  "FINANCE_ADMIN",
  "SUPPORT_ADMIN",
  "READ_ONLY",
] as const;

const createAdminSchema = z.object({
  email: z.string().trim().email("Email nije ispravan"),
  password: z.string().min(8, "Šifra mora imati najmanje 8 karaktera").max(128, "Šifra je predugačka"),
  name: z.string().trim().min(2, "Ime je prekratko").max(120, "Ime je predugačko").optional(),
  adminRole: z.enum(ALLOWED_STAFF_ROLES),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi("users_write", request);
    if (!auth.ok) return auth.response;
    if (auth.adminRole !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Samo SUPER_ADMIN može kreirati admin naloge." }, { status: 403 });
    }

    const parsed = createAdminSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos." },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const email = parsed.data.email.toLowerCase();
    const passwordHash = await hash(parsed.data.password, 12);
    const name = parsed.data.name?.trim() || "Admin Staff";
    const adminRole = parsed.data.adminRole;

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        role: true,
        adminProfile: { select: { adminRole: true } },
      },
    });

    if (existing?.adminProfile?.adminRole === "SUPER_ADMIN" && existing.id !== auth.session.user.id) {
      return NextResponse.json(
        { success: false, error: "SUPER_ADMIN nalog se ne može prepisati kroz ovu formu." },
        { status: 400 }
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const upsertedUser = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              role: "ADMIN",
              passwordHash,
              name,
            },
            select: { id: true, email: true, name: true, role: true },
          })
        : await tx.user.create({
            data: {
              email,
              name,
              passwordHash,
              role: "ADMIN",
            },
            select: { id: true, email: true, name: true, role: true },
          });

      await tx.adminProfile.upsert({
        where: { userId: upsertedUser.id },
        update: { adminRole },
        create: { userId: upsertedUser.id, adminRole },
      });

      return upsertedUser;
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_USER",
      entityType: "user",
      entityId: user.id,
      newValue: {
        adminCreatedOrUpdated: true,
        email: user.email,
        adminRole,
        created: !existing,
      },
    });

    return NextResponse.json({
      success: true,
      created: !existing,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        adminRole,
      },
    });
  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json({ success: false, error: "Greška pri kreiranju admin naloga." }, { status: 500 });
  }
}
