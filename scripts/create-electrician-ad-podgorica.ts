import { PrismaClient } from "@prisma/client";
import { notifyAdminsNewPendingRequest } from "@/lib/admin-signals";

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const requesterEmail = `oglas.elektricar.${ts}@local.invalid`;

  const request = await prisma.request.create({
    data: {
      category: "Električar",
      title: "Tražim električara u Podgorici",
      description:
        "Potreban električar za zamjenu osigurača u ormaru i provjeru instalacije u stanu (Stari aerodrom). Molim ponudu sa rokom dolaska.",
      city: "Podgorica",
      urgency: "U_NAREDNA_2_DANA",
      status: "OPEN",
      adminStatus: "PENDING_REVIEW",
      requesterName: "Marko P.",
      requesterPhone: "+38267000111",
      requesterEmail,
    },
    select: {
      id: true,
      title: true,
      category: true,
      city: true,
      urgency: true,
      adminStatus: true,
      createdAt: true,
    },
  });

  await notifyAdminsNewPendingRequest({
    requestId: request.id,
    category: request.category,
    city: request.city,
    title: request.title,
    urgency: request.urgency,
  });

  console.log(
    JSON.stringify(
      {
        request,
        url: `/request/${request.id}`,
        adminNotify: "sent (in-app + push kao na formi)",
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("[create-electrician-ad-podgorica] failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
