import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { createDistributionJob, processDistributionJob } from "@/lib/distribution-job";

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

    const jobId = await createDistributionJob(prisma, id);

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "APPROVE_REQUEST",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DISTRIBUTED", distributionJobId: jobId },
    });

    processDistributionJob(jobId).catch((err) =>
      console.error("[Approve] Distribution job error:", jobId, err)
    );

    return NextResponse.json({
      success: true,
      data: { adminStatus: "DISTRIBUTED", handymenNotified: "in_progress", jobId },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri odobravanju" },
      { status: 500 }
    );
  }
}
