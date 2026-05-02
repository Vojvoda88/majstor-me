/**
 * Zajednička logika za javni listing majstora (API + server-side first render).
 *
 * Jedan izvor istine za javnu vidljivost: `prismaWherePublicHandymanListingUserNotExcluded` + ACTIVE + (opciono kategorija + grad).
 * Kad je `city` postavljen, majstor mora raditi u tom gradu (`profile.cities` sadrži grad) ili imati prazan
 * `cities` i `User.city` jednak tom gradu (legacy).
 */
import type { Prisma } from "@prisma/client";
import { dbCategoryNamesForDistributionFilter, getInternalCategory } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getCityCoords } from "@/lib/cities";
import { calcHandymanScore } from "@/lib/handyman-score";
import {
  prismaAndClausesForPublicHandymanManualExcludes,
  prismaWherePublicHandymanListingUserNotExcluded,
} from "@/lib/demo-email";

const MAX_HANDYMEN_LOAD = 200;
const MAX_PAGE_SIZE = 50;

function buildPublicHandymanListingWhere(params: {
  categoryDbNames: string[] | null;
  city: string | null;
}): Prisma.UserWhereInput {
  const { categoryDbNames, city } = params;
  const categoryPart: Prisma.HandymanProfileWhereInput = categoryDbNames
    ? { workerCategories: { some: { category: { name: { in: categoryDbNames } } } } }
    : {};

  const activeProfile: Prisma.HandymanProfileWhereInput = {
    workerStatus: "ACTIVE",
    ...categoryPart,
  };

  const andParts: Prisma.UserWhereInput[] = [{ handymanProfile: { is: activeProfile } }];

  if (city) {
    andParts.push({
      OR: [
        {
          handymanProfile: {
            is: {
              ...activeProfile,
              cities: { has: city },
            },
          },
        },
        {
          AND: [
            { city: { equals: city } },
            {
              handymanProfile: {
                is: {
                  ...activeProfile,
                  OR: [{ cities: { isEmpty: true } }, { cities: { equals: [] } }],
                },
              },
            },
          ],
        },
      ],
    });
  }

  for (const clause of prismaAndClausesForPublicHandymanManualExcludes()) {
    andParts.push(clause);
  }

  return {
    role: "HANDYMAN",
    bannedAt: null,
    suspendedAt: null,
    ...prismaWherePublicHandymanListingUserNotExcluded(),
    AND: andParts,
  };
}

export type PublicHandymanListItem = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  /** Prva slika iz galerije (homepage kartica). */
  firstGalleryImageUrl?: string | null;
  /** Kratak bio za karticu (homepage). */
  bioSnippet?: string | null;
  verifiedStatus?: string;
  completedJobsCount?: number;
  averageResponseMinutes?: number | null;
  availabilityStatus?: string | null;
  isPromoted?: boolean;
  lat?: number;
  lng?: number;
};

export type PublicHandymenListResult = {
  items: PublicHandymanListItem[];
  total: number;
  page: number;
  totalPages: number;
};

const profileExt = (p: unknown) =>
  p as { averageResponseMinutes?: number | null; completedJobsCount?: number; isPromoted?: boolean };

type HandymanProfileShape = {
  ratingAvg: number;
  reviewCount: number;
  verifiedStatus: string;
  avatarUrl?: string | null;
  galleryImages?: string[];
  availabilityStatus?: string | null;
  workerCategories?: { category: { name: string } }[];
};

type UserWithProfile = {
  id: string;
  name: string | null;
  city: string | null;
  handymanProfile: HandymanProfileShape;
};

function mapItemFromUserCore(u: UserWithProfile, cityForCoords: string | null): PublicHandymanListItem {
  const prof = u.handymanProfile;
  const ext = profileExt(prof);
  const cForCoords = cityForCoords?.trim() || u.city;
  const coords = cForCoords ? getCityCoords(cForCoords) : null;
  return {
    id: u.id,
    name: u.name,
    city: u.city,
    categories:
      (prof as { workerCategories?: { category: { name: string } }[] }).workerCategories?.map(
        (wc) => wc.category.name
      ) ?? [],
    ratingAvg: prof.ratingAvg ?? 0,
    reviewCount: prof.reviewCount ?? 0,
    avatarUrl: (prof as { avatarUrl?: string }).avatarUrl ?? null,
    verifiedStatus: prof.verifiedStatus ?? "PENDING",
    completedJobsCount: ext.completedJobsCount ?? 0,
    averageResponseMinutes: ext.averageResponseMinutes ?? null,
    availabilityStatus: (prof as { availabilityStatus?: string }).availabilityStatus ?? null,
    isPromoted: ext.isPromoted ?? false,
    ...(coords && { lat: coords.lat, lng: coords.lng }),
  };
}

export async function getPublicHandymenList(params: {
  category?: string | null;
  city?: string | null;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<PublicHandymenListResult> {
  const { prisma } = await import("@/lib/db");
  const categoryParam = params.category ?? null;
  const city = params.city?.trim() || null;
  const sortBy = params.sortBy || "rating";
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE)
  );

  const resolvedCategory = categoryParam ? (getInternalCategory(categoryParam) ?? categoryParam) : null;
  const categoryDbNames = resolvedCategory ? dbCategoryNamesForDistributionFilter(resolvedCategory) : null;
  const baseWhere = buildPublicHandymanListingWhere({ categoryDbNames, city });

  const useDbPagination = !city && (sortBy === "rating" || sortBy === "reviews");
  let items: UserWithProfile[];
  let total: number;

  if (useDbPagination) {
    const orderByKey = sortBy === "reviews" ? "reviewCount" : "ratingAvg";
    const [users, count] = await Promise.all([
      prisma.user.findMany({
        where: baseWhere,
        include: {
          handymanProfile: {
            include: { workerCategories: { include: { category: true } } },
          },
        },
        orderBy: { handymanProfile: { [orderByKey]: "desc" } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({
        where: baseWhere,
      }),
    ]);
    items = users.filter((u) => !!u.handymanProfile) as UserWithProfile[];
    total = count;
  } else {
    const handymen = await prisma.user.findMany({
      where: baseWhere,
      include: {
        handymanProfile: {
          include: { workerCategories: { include: { category: true } } },
        },
      },
      take: MAX_HANDYMEN_LOAD,
    });

    const filtered = handymen.filter(
      (u): u is (typeof handymen)[number] & { handymanProfile: NonNullable<(typeof handymen)[number]["handymanProfile"]> } =>
        !!u.handymanProfile
    );
    const withScore = filtered.map((u) => {
      const prof = u.handymanProfile!;
      return {
        ...u,
        _score: calcHandymanScore(
          {
            city: u.city,
            handymanProfile: {
              ratingAvg: prof.ratingAvg,
              reviewCount: prof.reviewCount,
              verifiedStatus: prof.verifiedStatus,
              averageResponseMinutes: profileExt(prof).averageResponseMinutes,
              completedJobsCount: profileExt(prof).completedJobsCount,
            },
            isPromoted: profileExt(prof).isPromoted,
          },
          city
        ),
      };
    });
    withScore.sort((a, b) => b._score - a._score);
    total = withScore.length;
    const offset = (page - 1) * limit;
    items = withScore.slice(offset, offset + limit) as UserWithProfile[];
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: items.map((u) => mapItemFromUserCore(u, city)),
    total,
    page,
    totalPages,
  };
}

const HOME_FEATURED_FETCH_CAP = 160;

function compareHomepageFeatured(a: UserWithProfile, b: UserWithProfile): number {
  const pa = a.handymanProfile;
  const pb = b.handymanProfile;
  const ga = pa.galleryImages?.length ?? 0;
  const gb = pb.galleryImages?.length ?? 0;
  const hasAv = (p: typeof pa) => (p.avatarUrl?.trim() ? 1 : 0);
  const photoScore = (p: typeof pa, g: number) =>
    hasAv(p) * 400 + Math.min(g, 20) * 25 + (g > 0 && !hasAv(p) ? 80 : 0);

  const psA = photoScore(pa, ga);
  const psB = photoScore(pb, gb);
  if (psA !== psB) return psB - psA;

  const promA = profileExt(pa).isPromoted ? 1 : 0;
  const promB = profileExt(pb).isPromoted ? 1 : 0;
  if (promA !== promB) return promB - promA;

  const ra = (pa.ratingAvg ?? 0) - (pb.ratingAvg ?? 0);
  if (Math.abs(ra) > 1e-6) return ra > 0 ? -1 : 1;

  return (pb.reviewCount ?? 0) - (pa.reviewCount ?? 0);
}

function mapUserToPublicItemHome(u: UserWithProfile, cityForCoords: string | null): PublicHandymanListItem {
  const prof = u.handymanProfile;
  const gallery = (prof as { galleryImages?: string[] }).galleryImages ?? [];
  const firstGal = gallery[0]?.trim() || null;
  const avatar = (prof as { avatarUrl?: string | null }).avatarUrl?.trim() || null;
  const bioRaw = (prof as { bio?: string | null }).bio?.trim() ?? "";
  const bioSnippet =
    bioRaw.length > 0 ? bioRaw.replace(/\s+/g, " ").slice(0, 96) + (bioRaw.length > 96 ? "…" : "") : null;

  const base = mapItemFromUserCore(u, cityForCoords);
  return {
    ...base,
    firstGalleryImageUrl: firstGal,
    bioSnippet,
    avatarUrl: avatar,
  };
}

/**
 * Početna strana: istaknuti aktivni majstori — prednost profilima sa avatarom i/ili galerijom, zatim ocjena i promocija.
 */
export async function getHomepageFeaturedHandymen(limit = 6): Promise<PublicHandymanListItem[]> {
  const { prisma } = await import("@/lib/db");
  const baseWhere = buildPublicHandymanListingWhere({ categoryDbNames: null, city: null });

  const users = await prisma.user.findMany({
    where: baseWhere,
    include: {
      handymanProfile: {
        include: { workerCategories: { include: { category: true } } },
      },
    },
    take: HOME_FEATURED_FETCH_CAP,
  });

  const filtered = users.filter((u) => u.handymanProfile) as UserWithProfile[];

  filtered.sort(compareHomepageFeatured);

  const slice = filtered.slice(0, Math.max(0, limit));
  return slice.map((u) => mapUserToPublicItemHome(u, null));
}
