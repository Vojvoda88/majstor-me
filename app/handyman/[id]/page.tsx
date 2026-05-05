import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  CheckCircle2,
  Star,
  MapPin,
  MessageSquare,
  Briefcase,
  ImageIcon,
  MessageCircle,
  Award,
  MessageCircleMore,
} from "lucide-react";
import { viberLink, whatsappLink } from "@/lib/phone-links";
import { cityToSlug } from "@/lib/slugs";
import { getSiteUrl } from "@/lib/site-url";
import { localBusinessJsonLd } from "@/lib/json-ld";
import { AVATAR_IMAGE_FALLBACK } from "@/lib/homepage-data";
import { prismaWhereUserActiveHandymanForPublicCatalog } from "@/lib/handyman-truth";
import { SaveHandymanButton } from "@/components/handyman/save-handyman-button";
import { GalleryLightbox } from "@/components/handyman/gallery-lightbox";
import { cache } from "react";
import { withPerfLog } from "@/lib/perf";

export const dynamic = "force-dynamic";

const getPublicHandymanProfileById = cache(async (id: string) => {
  const { prisma } = await import("@/lib/db");
  return withPerfLog("handyman.profile.base", () =>
    prisma.user.findFirst({
      where: { id, ...prismaWhereUserActiveHandymanForPublicCatalog() },
      select: {
        id: true,
        name: true,
        city: true,
        handymanProfile: {
          select: {
            bio: true,
            cities: true,
            verifiedStatus: true,
            ratingAvg: true,
            reviewCount: true,
            avatarUrl: true,
            galleryImages: true,
            viberPhone: true,
            whatsappPhone: true,
            yearsOfExperience: true,
            startingPrice: true,
            completedJobsCount: true,
            averageResponseMinutes: true,
            availabilityStatus: true,
            isPromoted: true,
            workerCategories: { select: { category: { select: { name: true } } } },
          },
        },
      },
    })
  );
});

const getRecentReviewsForHandyman = cache(async (id: string) => {
  const { prisma } = await import("@/lib/db");
  return withPerfLog("handyman.profile.reviews", () =>
    prisma.review.findMany({
      where: { revieweeId: id },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
  );
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicHandymanProfileById(id);
  if (!user?.handymanProfile) notFound();
  const categories = user.handymanProfile.workerCategories.map((wc) => wc.category.name);
  const cat = categories[0] || "Majstor";
  const city = user.city || "";
  const base = getSiteUrl();
  const title = `${user.name} – ${cat}${city ? `, ${city}` : ""}`.trim();
  const bioTrim = user.handymanProfile.bio?.trim() ?? "";
  const description =
    bioTrim ||
    (categories.length > 0
      ? `${user.name} — ${cat}${city ? `, ${city}` : ""}. Javni profil na BrziMajstor.ME.`
      : `${user.name} — javni profil majstora na BrziMajstor.ME.`);
  const imageUrl =
    (user.handymanProfile as { avatarUrl?: string | null }).avatarUrl ??
    AVATAR_IMAGE_FALLBACK;

  return {
    title,
    description,
    alternates: { canonical: `${base}/handyman/${id}` },
    openGraph: {
      title: `${title} | BrziMajstor.ME`,
      description,
      url: `${base}/handyman/${id}`,
      siteName: "BrziMajstor.ME",
      type: "profile",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

export default async function HandymanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prisma } = await import("@/lib/db");
  const [user, reviewsReceived, session] = await Promise.all([
    getPublicHandymanProfileById(id),
    getRecentReviewsForHandyman(id),
    auth(),
  ]);

  if (!user?.handymanProfile) notFound();

  const profile = user.handymanProfile;
  const profileCategories = profile.workerCategories.map((wc) => wc.category.name);
  const profileExt = profile as {
    avatarUrl?: string | null;
    galleryImages?: string[];
    viberPhone?: string | null;
    whatsappPhone?: string | null;
    yearsOfExperience?: number | null;
    startingPrice?: number | null;
    completedJobsCount?: number;
    averageResponseMinutes?: number | null;
    availabilityStatus?: string | null;
    isPromoted?: boolean;
  };
  const avatarUrl = profileExt.avatarUrl;
  const galleryImages = profileExt.galleryImages ?? [];
  const heroImage = galleryImages[0] ?? avatarUrl ?? AVATAR_IMAGE_FALLBACK;
  const yearsOfExperience = profileExt.yearsOfExperience ?? null;
  const completedJobsCount = profileExt.completedJobsCount ?? 0;
  const isVerified = profile.verifiedStatus === "VERIFIED";
  const AVAILABILITY_LABELS: Record<string, string> = {
    AVAILABLE: "Dostupan",
    BUSY: "Zauzet",
    EMERGENCY_ONLY: "Samo hitne intervencije",
  };
  const backHref =
    session?.user?.role === "USER"
      ? "/dashboard/user"
      : session?.user?.role === "HANDYMAN"
        ? "/dashboard/handyman"
        : "/";

  const isSaved =
    session?.user?.role === "USER"
      ? !!(await withPerfLog("handyman.profile.saved_lookup", () =>
          prisma.savedHandyman.findUnique({
            where: { userId_handymanId: { userId: session.user.id, handymanId: user.id } },
            select: { id: true },
          })
        ))
      : false;

  const createParams = new URLSearchParams();
  if (profile.cities.length > 0) createParams.set("city", profile.cities[0]);
  if (profileCategories.length > 0)
    createParams.set("category", profileCategories[0]);

  const ldDescription =
    profile.bio?.trim() ||
    (profileCategories.length > 0
      ? `${user.name ?? "Majstor"} — ${profileCategories.join(", ")}${user.city ? `, ${user.city}` : profile.cities[0] ? `, ${profile.cities[0]}` : ""}.`
      : `${user.name ?? "Majstor"} — javni profil na BrziMajstor.ME.`);

  const jsonLd = localBusinessJsonLd({
    name: user.name ?? "Majstor",
    description: ldDescription,
    image: profileExt.avatarUrl ?? undefined,
    address: user.city ? { city: user.city } : undefined,
    aggregateRating:
      profile.reviewCount > 0
        ? { ratingValue: profile.ratingAvg, reviewCount: profile.reviewCount }
        : undefined,
  });

  return (
    <div className="min-h-screen bg-brand-page pb-28 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />
      <div className="pt-16">
        <Link
          href={backHref}
          className="absolute left-4 top-20 z-10 text-sm font-medium text-white drop-shadow-lg hover:underline md:left-6"
        >
          ← Nazad
        </Link>

        {/* Hero image */}
        <div className="relative h-[280px] w-full md:h-[380px]">
          <Image
            src={heroImage}
            alt={user.name ?? "Majstor"}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-end gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#E5E7EB] shadow-lg md:h-28 md:w-28">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" fill className="object-cover" sizes="112px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#475569] md:text-3xl">
                      {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                    </span>
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{user.name}</h1>
                  {profileCategories.length > 0 && (
                    <p className="mt-0.5 text-white/90">{profileCategories.join(", ")}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {profile.reviewCount > 0 ? (
                        <>
                          {profile.ratingAvg.toFixed(1)} ({profile.reviewCount} recenzija)
                        </>
                      ) : (
                        <>Još nema recenzija</>
                      )}
                    </span>
                    {user.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.city}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/90 md:text-[13px]">
                    {yearsOfExperience != null && yearsOfExperience > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-0.5 font-medium">
                        <Briefcase className="h-3.5 w-3.5" />
                        {yearsOfExperience}+ godina iskustva
                      </span>
                    )}
                    {completedJobsCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 font-medium">
                        {completedJobsCount} završenih poslova preko BrziMajstor.ME
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/90">
                        Verifikacija profila u toku
                      </span>
                    )}
                    {profileExt.availabilityStatus && profileExt.availabilityStatus !== "AVAILABLE" && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        profileExt.availabilityStatus === "BUSY"
                          ? "bg-red-500/40 text-white"
                          : "bg-amber-400/60 text-white"
                      }`}>
                        {AVAILABILITY_LABELS[profileExt.availabilityStatus] ?? profileExt.availabilityStatus}
                      </span>
                    )}
                    {profileExt.isPromoted && (
                      <span className="rounded-full bg-amber-400/80 px-2.5 py-0.5 text-xs font-medium text-white">
                        <Award className="mr-1 inline h-3.5 w-3.5" /> Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
          {session?.user?.role === "USER" && (profileExt.viberPhone || profileExt.whatsappPhone) && (
            <div className="mb-8 flex flex-wrap gap-3 md:mb-10">
              {profileExt.viberPhone && (
                <a
                  href={viberLink(profileExt.viberPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 min-w-[min(100%,280px)] flex-1 items-center justify-center gap-2 rounded-xl bg-[#7360F2] px-6 font-semibold text-white transition hover:bg-[#6350E0] sm:flex-initial"
                >
                  <MessageCircleMore className="h-5 w-5 shrink-0" />
                  Kontaktiraj putem Viber-a
                </a>
              )}
              {profileExt.whatsappPhone && (
                <a
                  href={whatsappLink(profileExt.whatsappPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 min-w-[min(100%,280px)] flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white transition hover:bg-[#20BD5A] sm:flex-initial"
                >
                  <MessageCircle className="h-5 w-5 shrink-0" />
                  Kontaktiraj putem WhatsApp-a
                </a>
              )}
            </div>
          )}
          {session?.user?.role === "USER" && (
            <div className="mb-8 md:mb-10">
              <p className="mb-2 text-xs text-[#64748B]">Besplatno. Bez obaveze.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`/request/create?${createParams}`} className="flex-1">
                  <span className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-base font-bold text-white shadow-btn-cta transition hover:brightness-105">
                    <MessageSquare className="h-5 w-5" />
                    Pošalji zahtjev
                  </span>
                </Link>
                <SaveHandymanButton handymanId={user.id} initialSaved={isSaved} />
              </div>
            </div>
          )}
          {!session && (
            <p className="mb-8 text-sm text-[#475569]">
              <Link href={`/login?callbackUrl=/handyman/${user.id}`} className="font-medium text-[#2563EB] hover:underline">
                Prijavite se
              </Link>{" "}
              da pošaljete zahtjev ovom majstoru.
            </p>
          )}

          <div className="space-y-8">
            {/* Galerija */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-marketplace-sm md:p-8">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-brand-navy">
                <ImageIcon className="h-6 w-6 text-blue-600" />
                Galerija radova
              </h3>
              {galleryImages.length > 0 ? (
                <GalleryLightbox images={galleryImages} />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center">
                  <ImageIcon className="mb-3 h-8 w-8 text-[#94A3B8]" />
                  <p className="text-sm font-medium text-[#475569]">Još nema slika u galeriji.</p>
                  <p className="mt-1 max-w-sm text-xs text-[#64748B]">
                    Kada majstor doda slike svojih radova, ovdje ćete moći da vidite završene projekte.
                  </p>
                </div>
              )}
            </div>

            {/* O meni */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-marketplace-sm md:p-8">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-brand-navy">
                <Briefcase className="h-6 w-6 text-blue-600" />
                O meni
              </h3>
              {profile.bio ? (
                <p className="text-[16px] leading-7 text-[#475569]">{profile.bio}</p>
              ) : (
                <p className="text-sm text-[#64748B]">
                  Majstor još nije dodao detaljniji opis profila. Možete poslati zahtjev ili ga kontaktirati za više
                  informacija o uslugama.
                </p>
              )}
              {profile.cities.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-[#0F172A]">Gradovi pokrivenosti</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.cities.map((c) => (
                      <Link
                        key={c}
                        href={`/grad/${cityToSlug(c)}`}
                        className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm text-[#475569] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recenzije */}
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
                <MessageCircle className="h-5 w-5 text-[#2563EB]" />
                Recenzije
              </h3>
              {reviewsReceived.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  Još nema javnih recenzija. Nakon završenog posla klijent može ostaviti ocjenu — tada će se ovdje
                  pojaviti.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviewsReceived.map((r) => {
                    const parts = r.reviewer.name?.trim().split(/\s+/) ?? [];
                    const initials = parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
                    return (
                      <div key={r.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-[#475569]">{initials}.</span>
                          </div>
                          <span className="text-xs text-[#64748B]">
                            {new Date(r.createdAt).toLocaleDateString("sr")}
                          </span>
                        </div>
                        {r.comment && <p className="mt-2 text-sm text-[#475569]">{r.comment}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {session?.user?.role === "USER" && (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/90 bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-12px_40px_rgba(10,22,40,0.12)] backdrop-blur-lg md:hidden">
          <Link
            href={`/request/create?${createParams}`}
            className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-lg font-bold text-white shadow-btn-cta transition hover:brightness-105"
          >
            Pošalji zahtjev
          </Link>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}
