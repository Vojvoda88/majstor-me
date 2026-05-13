/**
 * Jednokratno: novi zahtjev za Arslana (bojler / kamenac) — ista polja kao na admin snimku.
 *
 *   npx tsx scripts/create-arslan-boiler-request.ts
 *
 * Ako postoji korisnik sa emailom, veže zahtjev na njegov nalog; inače guest + guest link u izlazu.
 * Zahtjev ide na PENDING_REVIEW (kao normalna objava); admin ga odobri/distribuira u panelu.
 */
import { PrismaClient } from "@prisma/client";
import { notifyAdminsNewPendingRequest } from "@/lib/admin-signals";
import { generateGuestAccessSecret } from "@/lib/guest-request-token";

const prisma = new PrismaClient();

const EMAIL = "arslan.vlahovljak@gmail.com";
const NAME = "Arslan Vlahovljak";
const PHONE = "+38269605019";
const CITY = "Podgorica";
const TITLE = "Čišćenje bojlera od kamenca";
const DESCRIPTION =
  "Potrebno je očistiti bojler od kamenca vjerovatno jer se nivo tople vode smanjio u bojleru nego ranije.";
const CATEGORY = "Servis bojlera" as const;

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: EMAIL, mode: "insensitive" }, role: "USER" },
    select: { id: true, name: true, email: true },
  });

  let guestPlain: string | null = null;
  const base = {
    category: CATEGORY,
    title: TITLE,
    description: DESCRIPTION,
    city: CITY,
    urgency: "NIJE_HITNO" as const,
    status: "OPEN" as const,
    adminStatus: "PENDING_REVIEW" as const,
    requesterPhone: PHONE,
  };

  const request = user
    ? await prisma.request.create({
        data: {
          ...base,
          userId: user.id,
          requesterEmail: undefined,
        },
        select: {
          id: true,
          title: true,
          category: true,
          city: true,
          userId: true,
          adminStatus: true,
          createdAt: true,
        },
      })
    : await (async () => {
        const secret = generateGuestAccessSecret();
        guestPlain = secret.plain;
        return prisma.request.create({
          data: {
            ...base,
            userId: null,
            requesterName: NAME,
            requesterEmail: EMAIL,
            guestAccessTokenHash: secret.hash,
          },
          select: {
            id: true,
            title: true,
            category: true,
            city: true,
            userId: true,
            adminStatus: true,
            createdAt: true,
          },
        });
      })();

  await notifyAdminsNewPendingRequest({
    requestId: request.id,
    category: request.category,
    city: request.city,
    title: request.title,
    urgency: "NIJE_HITNO",
  });

  const origin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/^(?!https)/, "https://") ||
    "(postavi NEXTAUTH_URL za pun URL)";

  console.log(
    JSON.stringify(
      {
        ok: true,
        request,
        linkedUser: user ? { id: user.id, email: user.email, name: user.name } : null,
        publicUrl: `${origin}/request/${request.id}`,
        guestTrackingPath: guestPlain ? `/request-access/${guestPlain}` : null,
        note: "U adminu: odobri / distribuiraj kao i za ostale zahtjeve.",
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error("[create-arslan-boiler-request] failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
