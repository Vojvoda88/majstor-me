import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { createDistributionJob, processDistributionJob } from "@/lib/distribution-job";

export const dynamic = "force-dynamic";
/** Isto kao cron za distribuciju — approve sada čeka kraj procesa (Vercel inače ubije „fire-and-forget“ prije logova). */
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("requests_write");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const request = await prisma.request.findUnique({
      where: { id },
      select: { id: true, adminStatus: true },
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
      select: { id: true },
    });

    const jobId = await createDistributionJob(prisma, id);
    console.info("[Approve] distribution_jobs row created", { requestId: id, jobId });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "APPROVE_REQUEST",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DISTRIBUTED", distributionJobId: jobId },
    });

    console.info("[Approve] awaiting processDistributionJob (same invocation — logs follow)", { jobId });
    await processDistributionJob(jobId);
    const jobRow = await prisma.distributionJob.findUnique({
      where: { id: jobId },
      select: { status: true, resultMeta: true, lastError: true },
    });
    console.info("[Approve] processDistributionJob finished", {
      jobId,
      status: jobRow?.status,
      lastError: jobRow?.lastError ? jobRow.lastError.slice(0, 120) : null,
    });

    const meta = jobRow?.resultMeta as { handymenNotified?: number } | null;
    return NextResponse.json({
      success: true,
      data: {
        adminStatus: "DISTRIBUTED",
        jobId,
        distributionJobStatus: jobRow?.status ?? null,
        handymenNotified: typeof meta?.handymenNotified === "number" ? meta.handymenNotified : null,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri odobravanju" },
      { status: 500 }
    );
  }
}
