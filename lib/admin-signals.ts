/**
 * Admin obavještenja (in-app + push ako postoji pretplata) za pending zahtjeve i majstore.
 */
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import type { NotificationType } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";

async function getAdminUserIds(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

async function hasExistingAdminSignal(adminId: string, type: NotificationType, link: string): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: { userId: adminId, type, link },
    select: { id: true },
  });
  return !!existing;
}

/** Novi zahtjev u PENDING_REVIEW (nakon kreiranja, ne za SPAM). */
export async function notifyAdminsNewPendingRequest(params: {
  requestId: string;
  category: string;
  city: string;
  title?: string | null;
  urgency: string;
}): Promise<void> {
  const link = `/admin/requests/${params.requestId}`;
  const urgent =
    params.urgency === "HITNO_DANAS"
      ? " (hitno)"
      : params.urgency === "U_NAREDNA_2_DANA"
        ? " (uskoro)"
        : "";
  const title = `Novi zahtjev čeka pregled${urgent}`;
  const bodyParts = [params.category, params.city];
  if (params.title?.trim()) bodyParts.push(params.title.trim());
  const body = bodyParts.join(" · ");

  try {
    const adminIds = await getAdminUserIds();
    for (const uid of adminIds) {
      if (await hasExistingAdminSignal(uid, "ADMIN_PENDING_REQUEST", link)) continue;
      await createNotification(uid, "ADMIN_PENDING_REQUEST", title, {
        body,
        link,
      });
      void sendPushToUser(prisma, uid, {
        title,
        body: body || "Otvori zahtjev u admin panelu.",
        link,
        tag: `admin-req-${params.requestId}`,
      });
    }
  } catch (e) {
    console.warn("[admin-signals] notifyAdminsNewPendingRequest failed", e);
  }
}

/** Nova prijava majstora (profil PENDING_REVIEW) — jednom po korisniku (dedup po linku). */
export async function notifyAdminsNewPendingHandyman(params: {
  handymanUserId: string;
  displayName: string;
}): Promise<void> {
  const link = `/admin/handymen/${params.handymanUserId}`;
  const title = "Nova prijava majstora čeka pregled";
  const body = params.displayName.trim() || "Majstor bez naziva";

  try {
    const adminIds = await getAdminUserIds();
    for (const uid of adminIds) {
      if (await hasExistingAdminSignal(uid, "ADMIN_PENDING_HANDYMAN", link)) continue;
      await createNotification(uid, "ADMIN_PENDING_HANDYMAN", title, {
        body,
        link,
      });
      void sendPushToUser(prisma, uid, {
        title,
        body,
        link,
        tag: `admin-hm-${params.handymanUserId}`,
      });
    }
  } catch (e) {
    console.warn("[admin-signals] notifyAdminsNewPendingHandyman failed", e);
  }
}
