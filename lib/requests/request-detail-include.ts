import type { Prisma } from "@prisma/client";

/** Zajednički include za detalj zahtjeva (request stranica + guest access). */
export const requestDetailInclude = {
  user: { select: { id: true, name: true, city: true, emailVerified: true, phoneVerified: true } },
  contactUnlocks: { select: { handymanId: true } },
  offers: {
    include: {
      handyman: {
        select: {
          id: true,
          name: true,
          city: true,
          handymanProfile: {
            select: {
              bio: true,
              ratingAvg: true,
              reviewCount: true,
              verifiedStatus: true,
              workerCategories: { include: { category: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  review: true,
} satisfies Prisma.RequestInclude;

export type RequestDetailPayload = Prisma.RequestGetPayload<{ include: typeof requestDetailInclude }>;
