/**
 * Kriterijumi za uključivanje `/handyman/[id]` u sitemap (indeks vrijedan profil, bez SEO šuma).
 * Bazira se na `prismaWhereUserActiveHandymanTruth` (jedan izvor istine za „aktivnog majstora“),
 * uz dodatne SEO/quality uslove — uži podskup od javnog listinga.
 */
import type { Prisma } from "@prisma/client";
import { prismaWhereUserActiveHandymanTruth } from "@/lib/handyman-truth";

/**
 * Profil ulazi u sitemap ako zadovoljava aktivnu istinu PLUS:
 * - neprazno ime
 * - bar jedna lokacija: `User.city` ili neprazan `HandymanProfile.cities`
 * - bar jedna kategorija
 * - bar jedan signal sadržaja: recenzija, završen posao, bio, ili galerija
 */
export function prismaWhereHandymanSitemapEligible(): Prisma.UserWhereInput {
  return {
    AND: [
      prismaWhereUserActiveHandymanTruth(),
      { NOT: { name: { equals: "" } } },
      {
        OR: [{ city: { not: null } }, { handymanProfile: { cities: { isEmpty: false } } }],
      },
      {
        handymanProfile: {
          workerCategories: { some: {} },
          OR: [
            { reviewCount: { gte: 1 } },
            { completedJobsCount: { gte: 1 } },
            {
              AND: [{ bio: { not: null } }, { NOT: { bio: { equals: "" } } }],
            },
            { galleryImages: { isEmpty: false } },
          ],
        },
      },
    ],
  };
}
