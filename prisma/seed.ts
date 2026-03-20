/**
 * BrziMajstor.ME - Demo seed data for Nikšić
 * Run: npm run db:seed  OR  npx prisma db seed
 *
 * SAFETY: Does NOT delete existing data. Adds demo users (upsert by email),
 * new requests, offers, reviews. For production with real data: DO NOT RUN.
 * For empty DB or test env only.
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Vodoinstalater",
  "Električar",
  "Klima servis",
  "Moler / sitne kućne popravke",
  "Montaža namještaja",
  "Čišćenje",
  "Selidbe",
];

async function main() {
  const password = await hash("Test123!", 12);

  // Admin – upsert: ako nalog sa ovim emailom već postoji, postavi ga na ADMIN
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@brzimajstor.me";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Admin Korisnik" },
    create: {
      email: adminEmail,
      name: "Admin Korisnik",
      passwordHash: password,
      role: "ADMIN",
      city: "Nikšić",
    },
  });
  await prisma.handymanProfile.deleteMany({ where: { userId: admin.id } });
  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: { adminRole: "SUPER_ADMIN" },
    create: { userId: admin.id, adminRole: "SUPER_ADMIN" },
  });
  console.log("Admin:", admin.email);

  // Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "marko@test.me" },
      update: {},
      create: {
        email: "marko@test.me",
        name: "Marko Marković",
        passwordHash: password,
        role: "USER",
        city: "Nikšić",
        phone: "+382 69 123 456",
      },
    }),
    prisma.user.upsert({
      where: { email: "ana@test.me" },
      update: {},
      create: {
        email: "ana@test.me",
        name: "Ana Jovanović",
        passwordHash: password,
        role: "USER",
        city: "Nikšić",
      },
    }),
    prisma.user.upsert({
      where: { email: "petar@test.me" },
      update: {},
      create: {
        email: "petar@test.me",
        name: "Petar Petrović",
        passwordHash: password,
        role: "USER",
        city: "Nikšić",
      },
    }),
  ]);
  console.log("Users:", users.length);

  // Handymen
  const handymanUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "majstor.vodoinstalater@test.me" },
      update: {},
      create: {
        email: "majstor.vodoinstalater@test.me",
        name: "Miloš Vodoinstalater",
        passwordHash: password,
        role: "HANDYMAN",
        city: "Nikšić",
        phone: "+382 69 111 222",
      },
    }),
    prisma.user.upsert({
      where: { email: "majstor.elektricar@test.me" },
      update: {},
      create: {
        email: "majstor.elektricar@test.me",
        name: "Nikola Električar",
        passwordHash: password,
        role: "HANDYMAN",
        city: "Nikšić",
      },
    }),
    prisma.user.upsert({
      where: { email: "majstor.moler@test.me" },
      update: {},
      create: {
        email: "majstor.moler@test.me",
        name: "Dušan Moler",
        passwordHash: password,
        role: "HANDYMAN",
        city: "Nikšić",
        phone: "+382 69 333 444",
      },
    }),
    prisma.user.upsert({
      where: { email: "majstor.ciscenje@test.me" },
      update: {},
      create: {
        email: "majstor.ciscenje@test.me",
        name: "Jelena Čišćenje",
        passwordHash: password,
        role: "HANDYMAN",
        city: "Nikšić",
      },
    }),
    prisma.user.upsert({
      where: { email: "majstor.klima@test.me" },
      update: {},
      create: {
        email: "majstor.klima@test.me",
        name: "Stefan Klima Servis",
        passwordHash: password,
        role: "HANDYMAN",
        city: "Nikšić",
      },
    }),
  ]);

  const niksic = ["Nikšić"];

  const profileCategories: string[][] = [
    ["Vodoinstalater"],
    ["Električar"],
    ["Moler / sitne kućne popravke", "Montaža namještaja"],
    ["Čišćenje"],
    ["Klima servis"],
  ];

  for (let i = 0; i < handymanUsers.length; i++) {
    const u = handymanUsers[i];
    const prof = await prisma.handymanProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        bio:
          i === 0
            ? "Vodoinstalaterske usluge 15+ godina iskustva. Brzi odgovor."
            : i === 1
              ? "Električarske radove obavljam profesionalno i pouzdano."
              : i === 2
                ? "Moleraj, gipsarski radovi, sitne popravke."
                : i === 3
                  ? "Profesionalno čišćenje stanova i poslovnih prostora."
                  : "Servis i montaža klima uređaja.",
        cities: niksic,
        verifiedStatus: i < 2 ? "VERIFIED" : "PENDING",
        workerStatus: "ACTIVE",
        ratingAvg: i < 2 ? 4.5 : 0,
        reviewCount: i < 2 ? 3 : 0,
      },
    });

    const cats = profileCategories[i] ?? [];
    const categoryRecs = await prisma.category.findMany({
      where: { name: { in: cats } },
      select: { id: true },
    });
    for (const c of categoryRecs) {
      await prisma.workerCategory.upsert({
        where: {
          workerId_categoryId: { workerId: prof.id, categoryId: c.id },
        },
        update: {},
        create: { workerId: prof.id, categoryId: c.id },
      });
    }
  }
  console.log("Handymen:", handymanUsers.length);

  // Requests
  const requestData = [
    {
      userId: users[0].id,
      category: "Vodoinstalater",
      description: "Pukla cijev u kupatilu, voda curi. Hitno treba popravka.",
      city: "Nikšić",
      address: "Trg oslobođenja 5",
      urgency: "HITNO_DANAS" as const,
      status: "OPEN" as const,
      adminStatus: "DISTRIBUTED" as const,
    },
    {
      userId: users[0].id,
      category: "Električar",
      description: "Prekidač i utičnice ne rade ispravno u dnevnoj sobi. Potrebna provjera instalacija i popravka.",
      city: "Nikšić",
      address: "Trg oslobođenja 5",
      urgency: "U_NAREDNA_2_DANA" as const,
      status: "IN_PROGRESS" as const,
      adminStatus: "CONTACT_UNLOCKED" as const,
    },
    {
      userId: users[1].id,
      category: "Čišćenje",
      description: "Čišćenje stana nakon renoviranja, oko 45m2.",
      city: "Nikšić",
      urgency: "NIJE_HITNO" as const,
      status: "COMPLETED" as const,
      adminStatus: "CLOSED" as const,
    },
    {
      userId: users[1].id,
      category: "Klima servis",
      description: "Klima ne hladi kako treba, treba punjenje ili servis.",
      city: "Nikšić",
      address: "Bulevar Nemanjića 12",
      urgency: "U_NAREDNA_2_DANA" as const,
      status: "OPEN" as const,
      adminStatus: "DISTRIBUTED" as const,
    },
    {
      userId: users[2].id,
      category: "Montaža namještaja",
      description: "Montaža IKEA kuhinje, oko 3m.",
      city: "Nikšić",
      urgency: "NIJE_HITNO" as const,
      status: "OPEN" as const,
      adminStatus: "DISTRIBUTED" as const,
    },
    {
      userId: users[2].id,
      category: "Moler / sitne kućne popravke",
      description: "Krečenje dnevne sobe i hodnika, preboj.",
      city: "Nikšić",
      urgency: "U_NAREDNA_2_DANA" as const,
      status: "OPEN" as const,
      adminStatus: "DISTRIBUTED" as const,
    },
    {
      userId: users[0].id,
      category: "Selidbe",
      description: "Selidba iz stana u stan, prizemlje u prizemlje, bez lifta.",
      city: "Nikšić",
      urgency: "NIJE_HITNO" as const,
      status: "COMPLETED" as const,
      adminStatus: "CLOSED" as const,
    },
    {
      userId: users[1].id,
      category: "Vodoinstalater",
      description: "Zamjena stare bojler baterije, procuruje.",
      city: "Nikšić",
      urgency: "HITNO_DANAS" as const,
      status: "COMPLETED" as const,
      adminStatus: "CLOSED" as const,
    },
  ];

  const requests: { id: string; userId: string | null; category: string; status: string }[] = [];
  for (const r of requestData) {
    const created = await prisma.request.create({
      data: r,
    });
    requests.push(created);
  }
  console.log("Requests:", requests.length);

  // Offers - 10 offers across requests
  const vodoHandyman = handymanUsers[0];
  const elekHandyman = handymanUsers[1];
  const ciscenjeHandyman = handymanUsers[3];
  const klimaHandyman = handymanUsers[4];

  const openRequest1 = requests.find((r) => r.category === "Vodoinstalater" && r.status === "OPEN")!;
  const inProgressRequest = requests.find((r) => r.status === "IN_PROGRESS")!;
  const completedRequest1 = requests.find(
    (r) => r.category === "Čišćenje" && r.status === "COMPLETED"
  )!;
  const completedRequest2 = requests.find(
    (r) => r.category === "Vodoinstalater" && r.status === "COMPLETED"
  )!;
  const klimaRequest = requests.find((r) => r.category === "Klima servis")!;

  const offersToCreate = [
    { requestId: openRequest1.id, handymanId: vodoHandyman.id, priceType: "FIKSNA" as const, priceValue: 50 },
    { requestId: openRequest1.id, handymanId: elekHandyman.id, priceType: "PO_DOGOVORU" as const },
    { requestId: inProgressRequest.id, handymanId: elekHandyman.id, priceType: "FIKSNA" as const, priceValue: 80 },
    { requestId: klimaRequest.id, handymanId: klimaHandyman.id, priceType: "OKVIRNA" as const, priceValue: 40 },
    { requestId: klimaRequest.id, handymanId: vodoHandyman.id, priceType: "IZLAZAK_NA_TEREN" as const },
  ];

  for (const o of offersToCreate) {
    await prisma.offer.create({
      data: {
        ...o,
        message: "Mogu doći u naredna 2 dana.",
        status: o.requestId === inProgressRequest.id ? "ACCEPTED" : "PENDING",
      },
    });
  }

  // Accept offer on in_progress request - already done
  // Completed requests need accepted offers for reviews
  const completedCiscenje = requests.find(
    (r) => r.category === "Čišćenje" && r.status === "COMPLETED"
  )!;
  const completedVodo = requests.find(
    (r) => r.category === "Vodoinstalater" && r.status === "COMPLETED"
  )!;
  const completedSelidbe = requests.find((r) => r.category === "Selidbe")!;

  for (const req of [completedCiscenje, completedVodo, completedSelidbe]) {
    const existingOffer = await prisma.offer.findFirst({
      where: { requestId: req.id },
    });
    if (!existingOffer) {
      const handymanId =
        req.category === "Čišćenje"
          ? ciscenjeHandyman.id
          : req.category === "Vodoinstalater"
            ? vodoHandyman.id
            : handymanUsers[2].id; // Moler - selidbe/montaža
      const offer = await prisma.offer.create({
        data: {
          requestId: req.id,
          handymanId,
          priceType: "FIKSNA",
          priceValue: 60,
          status: "ACCEPTED",
        },
      });
      // Update request if needed
      await prisma.request.update({
        where: { id: req.id },
        data: { status: "COMPLETED" },
      });
    }
  }

  // Add more offers to reach 10 total
  const montazaRequest = requests.find((r) => r.category === "Montaža namještaja")!;
  const molerRequest = requests.find((r) => r.category === "Moler / sitne kućne popravke")!;

  await prisma.offer.create({
    data: {
      requestId: montazaRequest.id,
      handymanId: handymanUsers[2].id,
      priceType: "FIKSNA",
      priceValue: 120,
      message: "Montaža IKEA namještaja, iskustvo 8 godina.",
    },
  });
  await prisma.offer.create({
    data: {
      requestId: molerRequest.id,
      handymanId: handymanUsers[2].id,
      priceType: "OKVIRNA",
      priceValue: 150,
      message: "Krečenje po m2, procjena na licu mjesta.",
    },
  });
  await prisma.offer.create({
    data: {
      requestId: openRequest1.id,
      handymanId: handymanUsers[2].id,
      priceType: "IZLAZAK_NA_TEREN",
      message: "Mogu doći sutra popodne.",
    },
  });

  // Reviews - 3 completed jobs with reviews
  const completedWithOffers = await prisma.request.findMany({
    where: { status: "COMPLETED" },
    include: { offers: { where: { status: "ACCEPTED" } }, review: true },
  });

  let reviewCount = 0;
  for (const req of completedWithOffers) {
    if (req.review || !req.offers[0] || !req.userId) continue;
    if (reviewCount >= 3) break;

    await prisma.review.create({
      data: {
        requestId: req.id,
        reviewerId: req.userId,
        revieweeId: req.offers[0].handymanId,
        rating: reviewCount === 0 ? 5 : reviewCount === 1 ? 4 : 5,
        comment:
          reviewCount === 0
            ? "Odličan majstor, brz i pouzdan!"
            : reviewCount === 1
              ? "Zadovoljan radom, preporučujem."
              : "Profesionalno urađeno.",
      },
    });

    const revieweeId = req.offers[0].handymanId;
    const reviews = await prisma.review.findMany({ where: { revieweeId } });
    const avg =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    await prisma.handymanProfile.update({
      where: { userId: revieweeId },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
      },
    });

    reviewCount++;
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
