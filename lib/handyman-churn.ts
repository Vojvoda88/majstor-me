import { Prisma } from "@prisma/client";
import type { PrismaClient, HandymanChurnReason } from "@prisma/client";

type CreateChurnEventParams = {
  userId: string;
  emailSnapshot?: string | null;
  nameSnapshot?: string | null;
  reason: HandymanChurnReason;
  actorType: "USER_SELF" | "ADMIN";
  actorUserId?: string | null;
  metadata?: unknown;
};

export async function createHandymanChurnEvent(
  prisma: PrismaClient | Prisma.TransactionClient,
  params: CreateChurnEventParams
): Promise<void> {
  try {
    await prisma.handymanChurnEvent.create({
      data: {
        userId: params.userId,
        emailSnapshot: params.emailSnapshot ?? null,
        nameSnapshot: params.nameSnapshot ?? null,
        reason: params.reason,
        actorType: params.actorType,
        actorUserId: params.actorUserId ?? null,
        metadata:
          params.metadata != null
            ? (params.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("[handyman-churn] create event failed", error);
  }
}
