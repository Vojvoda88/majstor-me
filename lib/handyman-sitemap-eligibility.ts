/**
 * Kriterijumi za uključivanje `/handyman/[id]` u sitemap (indeks vrijedan profil, bez SEO šuma).
 * Javna stranica profila može ostati dostupna i za one koji ne zadovoljavaju ovo — samo ne idu u sitemap.
 */
import type { Prisma } from "@prisma/client";
import { prismaWhereHandymanEmailNotDemo } from "@/lib/demo-email";

/**
 * Profil ulazi u sitemap ako je:
 * - HANDYMAN, nije suspendovan/banovan
 * - email nije demo (@local.majstor.demo) ni test seed (@test.me)
 * - workerStatus ACTIVE
 * - bar jedna kategorija
 * - bar jedna lokacija: `User.city` ili neprazan `HandymanProfile.cities`
 * - bar jedan signal sadržaja: recenzija, završen posao preko platforme, neprazan bio, ili galerija slika
 */
export function prismaWhereHandymanSitemapEligible(): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    bannedAt: null,
    suspendedAt: null,
    AND: [
      prismaWhereHandymanEmailNotDemo(),
      { NOT: { name: { equals: "" } } },
      {
        OR: [{ city: { not: null } }, { handymanProfile: { cities: { isEmpty: false } } }],
      },
      {
        handymanProfile: {
          AND: [
            { workerStatus: "ACTIVE" },
            { workerCategories: { some: {} } },
            {
              OR: [
                { reviewCount: { gte: 1 } },
                { completedJobsCount: { gte: 1 } },
                {
                  AND: [{ bio: { not: null } }, { NOT: { bio: { equals: "" } } }],
                },
                { galleryImages: { isEmpty: false } },
              ],
            },
          ],
        },
      },
    ],
  };
}
