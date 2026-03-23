/**
 * Zajednička logika za javni listing majstora (API + server-side first render).
 */
import { dbCategoryNamesForDistributionFilter, getInternalCategory } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getCityCoords } from "@/lib/cities";
import { calcHandymanScore } from "@/lib/handyman-score";
import { prismaWhereHandymanEmailNotDemo } from "@/lib/demo-email";

const MAX_HANDYMEN_LOAD = 200;
const MAX_PAGE_SIZE = 50;

export type PublicHandymanListItem = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
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
  availabilityStatus?: string | null;
  workerCategories?: { category: { name: string } }[];
};

type UserWithProfile = {
  id: string;
  name: string | null;
  city: string | null;
  handymanProfile: HandymanProfileShape;
};

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
  const baseWhere = {
    role: "HANDYMAN" as const,
    bannedAt: null,
    suspendedAt: null,
    ...prismaWhereHandymanEmailNotDemo(),
    handymanProfile: {
      workerStatus: "ACTIVE" as const,
      ...(categoryDbNames && {
        workerCategories: {
          some: { category: { name: { in: categoryDbNames } } },
        },
      }),
    },
  };

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

  const mapItem = (u: UserWithProfile): PublicHandymanListItem => {
    const prof = u.handymanProfile;
    const ext = profileExt(prof);
    const c = u.city;
    const coords = c ? getCityCoords(c) : null;
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
  };

  return {
    items: items.map(mapItem),
    total,
    page,
    totalPages,
  };
}
