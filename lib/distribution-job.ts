/**
 * Queue za distribuciju zahtjeva – DB-backed job (bez Redis).
 * Approve kreira job; processor obrađuje u pozadini s retry i loggingom.
 */

import type { PrismaClient } from "@prisma/client";
import { distributeRequestToHandymen } from "./request-distribution";
import { canDistributeRequestToHandymen } from "./request-approval-gates";

const MAX_ATTEMPTS = 3;

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export async function createDistributionJob(
  prisma: PrismaClient,
  requestId: string
): Promise<string> {
  const job = await prisma.distributionJob.create({
    data: {
      requestId,
      status: "PENDING",
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    },
  });
  return job.id;
}

export async function processDistributionJob(jobId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/db");

  const job = await prisma.distributionJob.findUnique({
    where: { id: jobId },
  });
  if (!job || job.status === "COMPLETED") return true;
  if (job.attempts >= job.maxAttempts) {
    await prisma.distributionJob.update({
      where: { id: jobId },
      data: { status: "FAILED", lastError: "Max attempts exceeded", processedAt: new Date() },
    });
    console.warn("[DistributionJob] Job failed (max attempts):", jobId);
    return false;
  }

  const request = await prisma.request.findUnique({
    where: { id: job.requestId },
  });
  if (!request) {
    await prisma.distributionJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        lastError: "Request not found",
        attempts: job.attempts + 1,
        processedAt: new Date(),
      },
    });
    return false;
  }

  if (
    !canDistributeRequestToHandymen({
      status: request.status,
      adminStatus: request.adminStatus,
      deletedAt: request.deletedAt,
    })
  ) {
    await prisma.distributionJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        lastError: "Request is not approved for handyman distribution",
        attempts: job.attempts + 1,
        processedAt: new Date(),
      },
    });
    console.warn("[DistributionJob] Blocked by approval gate", {
      jobId,
      requestId: request.id,
      status: request.status,
      adminStatus: request.adminStatus,
      deletedAt: !!request.deletedAt,
    });
    return false;
  }

  await prisma.distributionJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", attempts: job.attempts + 1 },
  });

  console.info("[DistributionJob] distribute start", { jobId, requestId: request.id });

  try {
    const result = await distributeRequestToHandymen({
      prisma,
      requestId: request.id,
      category: request.category,
      city: request.city,
      title: request.title,
      description: request.description,
      urgency: request.urgency,
    });

    await prisma.distributionJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        resultMeta: { handymenNotified: result.handymenNotified, durationMs: result.durationMs },
      },
    });
    console.info(
      "[DistributionJob] Completed:",
      jobId,
      "handymenNotified:",
      result.handymenNotified,
      "durationMs:",
      result.durationMs
    );
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.distributionJob.update({
      where: { id: jobId },
      data: {
        status: job.attempts + 1 >= job.maxAttempts ? "FAILED" : "PENDING",
        lastError: msg.slice(0, 2000),
        processedAt: job.attempts + 1 >= job.maxAttempts ? new Date() : null,
      },
    });
    console.error("[DistributionJob] Error:", jobId, msg);
    return false;
  }
}

/** Procesira jedan PENDING job (za cron ili nakon approve). */
export async function processNextPendingJob(): Promise<string | null> {
  const { prisma } = await import("@/lib/db");
  const job = await prisma.distributionJob.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  if (!job) return null;
  await processDistributionJob(job.id);
  return job.id;
}
