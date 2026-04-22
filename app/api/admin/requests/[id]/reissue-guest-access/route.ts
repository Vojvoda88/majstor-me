import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { generateGuestAccessSecret } from "@/lib/guest-request-token";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/**
 * Guest zahtjevi čuvaju samo SHA-256 hash tokena — izgubljeni link se ne može „pročitati“ iz baze.
 * Admin izdaje novi token (stari link prestaje da radi).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("requests_write", _req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const row = await prisma.request.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!row) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (row.userId != null) {
      return NextResponse.json(
        { success: false, error: "Zahtjev je vezan za registrovanog korisnika — guest link nije potreban." },
        { status: 400 }
      );
    }

    const secret = generateGuestAccessSecret();
    await prisma.request.update({
      where: { id },
      data: { guestAccessTokenHash: secret.hash },
      select: { id: true },
    });

    const base = getSiteUrl();
    const accessUrl = `${base.replace(/\/$/, "")}/request-access/${encodeURIComponent(secret.plain)}`;

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "REISSUE_GUEST_ACCESS",
      entityType: "request",
      entityId: id,
      newValue: { reissued: true },
    });

    return NextResponse.json({
      success: true,
      data: { accessUrl, token: secret.plain },
    });
  } catch (error) {
    console.error("[reissue-guest-access]", error);
    return NextResponse.json({ success: false, error: "Greška pri izdavanju linka" }, { status: 500 });
  }
}
