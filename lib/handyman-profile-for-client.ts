import type { Prisma } from "@prisma/client";

/** Podaci koje HandymanProfileForm može primiti sa servera (JSON-serijalizabilno). */
export type HandymanProfileClientProps = {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  galleryImages: string[];
  cities: string[];
  categories: string[];
  yearsOfExperience: number | null;
  startingPrice: number | null;
  completedJobsCount: number;
  averageResponseMinutes: number | null;
  serviceAreasDescription: string | null;
  travelRadiusKm: number | null;
  availabilityStatus: string | null;
  viberPhone: string | null;
  whatsappPhone: string | null;
  phone: string | null;
};

export type HandymanProfileWithWorkerCategories = Prisma.HandymanProfileGetPayload<{
  include: { workerCategories: { include: { category: true } } };
}>;

/**
 * Bez ...spread Prisma objekta: Date i ugniježđeni relation objekti nisu sigurni za Server → Client props.
 */
export function mapHandymanProfileForClient(
  profileRaw: HandymanProfileWithWorkerCategories | null,
  phoneFromUser: string | null | undefined
): HandymanProfileClientProps | null {
  if (!profileRaw) return null;
  return {
    id: profileRaw.id,
    userId: profileRaw.userId,
    bio: profileRaw.bio,
    avatarUrl: profileRaw.avatarUrl,
    galleryImages: [...(profileRaw.galleryImages ?? [])],
    cities: [...profileRaw.cities],
    categories: profileRaw.workerCategories.map((wc) => wc.category.name),
    yearsOfExperience: profileRaw.yearsOfExperience,
    startingPrice: profileRaw.startingPrice,
    completedJobsCount: profileRaw.completedJobsCount,
    averageResponseMinutes: profileRaw.averageResponseMinutes,
    serviceAreasDescription: profileRaw.serviceAreasDescription,
    travelRadiusKm: profileRaw.travelRadiusKm,
    availabilityStatus: profileRaw.availabilityStatus,
    viberPhone: profileRaw.viberPhone,
    whatsappPhone: profileRaw.whatsappPhone,
    phone: phoneFromUser ?? null,
  };
}
