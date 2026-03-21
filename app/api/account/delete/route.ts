import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Ne abortuje PG transakciju — koristi se prije `$transaction`. */
async function deleteDistributionJobsIfTableExists(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = 'distribution_jobs'
    ) AS "exists"
  `;
  if (!rows[0]?.exists) return;

  await prisma.$executeRaw`
    DELETE FROM distribution_jobs
    WHERE request_id IN (SELECT id FROM requests WHERE user_id = ${userId})
  `;
}

/**
 * Briše nalog trenutno prijavljenog korisnika.
 * Dostupno samo za USER i HANDYMAN (ne i za ADMIN).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Niste prijavljeni" }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Admin nalog se ne može obrisati ovdje. Koristite admin panel." },
      { status: 400 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");
    const userId = session.user.id;

    /**
     * `distribution_jobs` mora biti izvan `$transaction`: ako DELETE padne unutra,
     * PostgreSQL abortuje cijelu transakciju (25P02) čak i uz try/catch u JS-u.
     */
    await deleteDistributionJobsIfTableExists(prisma, userId);

    /**
     * Potpuno eksplicitno brisanje: neke baze (ili starije migracije) nemaju CASCADE
     * na svim FK-ovima — jedan `user.delete()` može pasti (npr.
     * push_subscriptions bez CASCADE, funnel_events sa FK, itd.).
     */
    await prisma.$transaction(
      async (tx) => {
        // 1) funnel_events — user_id je opciono; ako postoji FK ka users, oslobodi redove
        await tx.funnelEvent.updateMany({
          where: { userId },
          data: { userId: null },
        });

        // 2) Direktne veze na korisnika (sigurno prije brisanja zahtjeva / naloga)
        await tx.pushSubscription.deleteMany({ where: { userId } });
        await tx.notification.deleteMany({ where: { userId } });
        await tx.creditTransaction.deleteMany({ where: { handymanId: userId } });
        await tx.message.deleteMany({ where: { senderId: userId } });
        await tx.offer.deleteMany({ where: { handymanId: userId } });
        await tx.review.deleteMany({
          where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] },
        });
        await tx.report.deleteMany({
          where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] },
        });
        await tx.requestContactUnlock.deleteMany({ where: { handymanId: userId } });
        await tx.handymanInvite.deleteMany({ where: { inviterId: userId } });
        await tx.adminAction.deleteMany({ where: { adminId: userId } });

        // 3) Zahtjevi koje je korisnik kreirao (ostale tabele ka request-u idu kaskadom)
        await tx.request.deleteMany({ where: { userId } });

        await tx.handymanProfile.deleteMany({ where: { userId } });
        await tx.adminProfile.deleteMany({ where: { userId } });

        // `deleteMany` umjesto `delete`: ne baca P2025 ako red više ne postoji (dupli klik / retry).
        await tx.user.deleteMany({ where: { id: userId } });
      },
      { maxWait: 15000, timeout: 60000 }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete account error:", e);
    const known = e instanceof Prisma.PrismaClientKnownRequestError ? e : null;
    const dev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        success: false,
        error: "Greška pri brisanju naloga",
        ...(dev && {
          debug: {
            code: known?.code,
            message: e instanceof Error ? e.message : String(e),
            meta: known?.meta,
          },
        }),
      },
      { status: 500 }
    );
  }
}
