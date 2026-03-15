import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
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

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id, role: "HANDYMAN" },
    include: {
      handymanProfile: { include: { workerCategories: { include: { category: true } } } },
    },
  });
  if (!user?.handymanProfile) return { title: "Majstor | Majstor.me" };
  const categories = user.handymanProfile.workerCategories.map((wc) => wc.category.name);
  const cat = categories[0] || "Majstor";
  const city = user.city || "";
  const base = getSiteUrl();
  return {
    title: `${user.name} - ${cat} ${city ? city : ""} | Majstor.me`.trim(),
    description: user.handymanProfile.bio || `Profil majstora ${user.name}`,
    alternates: { canonical: `${base}/handyman/${id}` },
  };
}

export default async function HandymanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id, role: "HANDYMAN" },
    include: {
      handymanProfile: { include: { workerCategories: { include: { category: true } } } },
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

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
  const isVerified = profile.verifiedStatus === "VERIFIED";
  const AVAILABILITY_LABELS: Record<string, string> = {
    AVAILABLE: "Dostupan",
    BUSY: "Zauzet",
    EMERGENCY_ONLY: "Samo hitne intervencije",
  };
  const session = await auth();
  const backHref =
    session?.user?.role === "USER"
      ? "/dashboard/user"
      : session?.user?.role === "HANDYMAN"
        ? "/dashboard/handyman"
        : "/";

  const createParams = new URLSearchParams();
  if (profile.cities.length > 0) createParams.set("city", profile.cities[0]);
  if (profileCategories.length > 0)
    createParams.set("category", profileCategories[0]);

  const jsonLd = localBusinessJsonLd({
    name: user.name ?? "Majstor",
    description: profile.bio ?? undefined,
    image: profileExt.avatarUrl ?? undefined,
    address: user.city ? { city: user.city } : undefined,
    aggregateRating:
      profile.reviewCount > 0
        ? { ratingValue: profile.ratingAvg, reviewCount: profile.reviewCount }
        : undefined,
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-28 md:pb-10">
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
                      {profile.ratingAvg.toFixed(1)} ({profile.reviewCount} recenzija)
                    </span>
                    {user.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.city}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
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

        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
          {(profileExt.viberPhone || profileExt.whatsappPhone) && (
            <div className="mb-8 flex flex-wrap gap-3 md:mb-10">
              {profileExt.viberPhone && (
                <a
                  href={viberLink(profileExt.viberPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#7360F2] px-6 font-semibold text-white transition hover:bg-[#6350E0]"
                >
                  <MessageCircleMore className="h-5 w-5" />
                  Kontaktiraj putem Viber-a
                </a>
              )}
              {profileExt.whatsappPhone && (
                <a
                  href={whatsappLink(profileExt.whatsappPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white transition hover:bg-[#20BD5A]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Kontaktiraj putem WhatsApp-a
                </a>
              )}
            </div>
          )}
          {session?.user?.role === "USER" && (
            <Link href={`/request/create?${createParams}`} className="mb-8 block w-full md:mb-10">
              <span className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] font-semibold text-white transition hover:bg-[#1D4ED8]">
                <MessageSquare className="h-5 w-5" />
                Pošalji zahtjev
              </span>
            </Link>
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
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
                <ImageIcon className="h-5 w-5 text-[#2563EB]" />
                Galerija radova
              </h3>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {galleryImages.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square overflow-hidden rounded-lg bg-[#F3F4F6]"
                    >
                      <Image src={url} alt={`Rad ${idx + 1}`} fill className="object-cover" sizes="200px" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">Nema slika u galeriji.</p>
              )}
            </div>

            {/* O meni */}
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
                <Briefcase className="h-5 w-5 text-[#2563EB]" />
                O meni
              </h3>
              {profile.bio ? (
                <p className="text-[16px] leading-7 text-[#475569]">{profile.bio}</p>
              ) : (
                <p className="text-sm text-[#64748B]">Nema opisa.</p>
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
              {user.reviewsReceived.length === 0 ? (
                <p className="text-sm text-[#64748B]">Još nema recenzija.</p>
              ) : (
                <div className="space-y-4">
                  {user.reviewsReceived.map((r) => {
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
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-lg md:hidden">
          <Link
            href={`/request/create?${createParams}`}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-[#2563EB] text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Pošalji zahtjev
          </Link>
        </div>
      )}
    </div>
  );
}
