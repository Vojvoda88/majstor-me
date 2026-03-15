import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { distributeRequestToHandymen } from "@/lib/request-distribution";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("requests");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const request = await prisma.request.findUnique({
      where: { id },
      include: { offers: { select: { id: true } } },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (request.adminStatus === "DISTRIBUTED") {
      return NextResponse.json(
        { success: false, error: "Zahtjev je već distribuiran" },
        { status: 400 }
      );
    }

    if (!["PENDING_REVIEW", null].includes(request.adminStatus)) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije na čekanju odobrenja" },
        { status: 400 }
      );
    }

    await prisma.request.update({
      where: { id },
      data: { adminStatus: "DISTRIBUTED" },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "APPROVE_REQUEST",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DISTRIBUTED", distribution: "async" },
    });

    distributeRequestToHandymen({
      prisma,
      requestId: id,
      category: request.category,
      city: request.city,
      title: request.title,
      description: request.description,
    }).catch((err) => console.error("Background distribution error:", err));

    return NextResponse.json({
      success: true,
      data: { adminStatus: "DISTRIBUTED", handymenNotified: "in_progress" },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri odobravanju" },
      { status: 500 }
    );
  }
}
