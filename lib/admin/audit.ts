/**
 * Audit log za admin akcije.
 */

import { Prisma, type PrismaClient } from "@prisma/client";

export type AuditActionType =
  | "LOGIN"
  | "LOGOUT"
  | "EDIT_USER"
  | "EDIT_WORKER"
  | "SUSPEND"
  | "BAN"
  | "UNSUSPEND"
  | "UNBAN"
  | "ADD_CREDITS"
  | "REMOVE_CREDITS"
  | "DELETE"
  | "RESTORE"
  | "SETTINGS_CHANGE"
  | "BLACKLIST_PHONE"
  | "BLACKLIST_EMAIL"
  | "UNBLACKLIST_PHONE"
  | "UNBLACKLIST_EMAIL"
  | "NOTIFICATION_RESEND"
  | "VERIFY_HANDYMAN"
  | "APPROVE_REQUEST"
  | "REJECT_REQUEST"
  | "APPROVE_WORKER"
  | "REJECT_WORKER"
  | "EDIT_REQUEST"
  | "MARK_SPAM"
  | "MARK_REQUEST_SUSPICIOUS"
  | "EDIT_OFFER"
  | "EDIT_CATEGORY"
  | "EDIT_CITY"
  | "EDIT_FAQ"
  | "REJECT_REPORT"
  | "RESOLVE_REPORT";

export type AuditEntityType =
  | "user"
  | "handyman"
  | "request"
  | "offer"
  | "report"
  | "credit_transaction"
  | "category"
  | "city"
  | "faq"
  | "blacklist"
  | "settings";

export async function createAuditLog(
  prisma: PrismaClient,
  params: {
    adminId: string;
    adminRole: string;
    actionType: AuditActionType;
    entityType: AuditEntityType;
    entityId?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
    reason?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        adminRole: params.adminRole,
        actionType: params.actionType,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        oldValue: params.oldValue != null ? (params.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValue: params.newValue != null ? (params.newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        reason: params.reason ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}
