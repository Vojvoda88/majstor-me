import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { REQUEST_CATEGORY_FALLBACK, REQUEST_CREATE_CATEGORY_CHOICES } from "@/lib/constants";
import { canDistributeRequestToHandymen, getDistributionBlockMessageSr } from "@/lib/request-approval-gates";
import { distributeRequestToHandymenForExtraCategories } from "@/lib/request-distribution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set(REQUEST_CREATE_CATEGORY_CHOICES as readonly string[]);

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), category: z.string().min(1) }),
  z.object({ action: z.literal("remove"), category: z.string().min(1) }),
]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("requests_write", req);
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos" },
      { status: 400 }
    );
  }

  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  const row = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      category: true,
      city: true,
      status: true,
      adminStatus: true,
      deletedAt: true,
      extraDistributionCategories: true,
    },
  });

  if (!row) {
    return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
  }

  const cat = parsed.data.category.trim();
  if (!ALLOWED.has(cat) || cat === REQUEST_CATEGORY_FALLBACK) {
    return NextResponse.json({ success: false, error: "Kategorija nije dozvoljena za dodavanje" }, { status: 400 });
  }
  if (cat === row.category) {
    return NextResponse.json(
      { success: false, error: "Ovo je već glavna kategorija zahtjeva — nije potrebno dodavati." },
      { status: 400 }
    );
  }

  if (parsed.data.action === "add") {
    if (row.extraDistributionCategories.includes(cat)) {
      return NextResponse.json({ success: false, error: "Kategorija je već na listi" }, { status: 400 });
    }
    if (!canDistributeRequestToHandymen(row)) {
      return NextResponse.json(
        {
          success: false,
          error:
            getDistributionBlockMessageSr(row) ??
            "Zahtjev nije u statusu za novu distribuciju majstorima.",
        },
        { status: 400 }
      );
    }

    const nextExtras = [...row.extraDistributionCategories, cat];
    await prisma.request.update({
      where: { id },
      data: { extraDistributionCategories: nextExtras },
      select: { id: true },
    });

    const dist = await distributeRequestToHandymenForExtraCategories({
      prisma,
      requestId: id,
      city: row.city,
      extraInternalCategories: [cat],
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_REQUEST",
      entityType: "request",
      entityId: id,
      oldValue: { extraDistributionCategories: row.extraDistributionCategories },
      newValue: { extraDistributionCategories: nextExtras, handymenNotified: dist.handymenNotified },
    });

    return NextResponse.json({
      success: true,
      data: { extraDistributionCategories: nextExtras, handymenNotified: dist.handymenNotified },
    });
  }

  // remove
  if (!row.extraDistributionCategories.includes(cat)) {
    return NextResponse.json({ success: false, error: "Kategorija nije na listi" }, { status: 400 });
  }
  const nextExtras = row.extraDistributionCategories.filter((c) => c !== cat);
  await prisma.request.update({
    where: { id },
    data: { extraDistributionCategories: nextExtras },
    select: { id: true },
  });

  await createAuditLog(prisma, {
    adminId: auth.session.user.id,
    adminRole: auth.adminRole,
    actionType: "EDIT_REQUEST",
    entityType: "request",
    entityId: id,
    oldValue: { extraDistributionCategories: row.extraDistributionCategories },
    newValue: { extraDistributionCategories: nextExtras },
  });

  return NextResponse.json({ success: true, data: { extraDistributionCategories: nextExtras } });
}
