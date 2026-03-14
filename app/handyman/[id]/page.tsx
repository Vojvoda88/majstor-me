import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import {
  CheckCircle2,
  Star,
  MapPin,
  Wrench,
  MessageSquare,
  Briefcase,
  ImageIcon,
  MessageCircle,
  Award,
} from "lucide-react";
import { cityToSlug } from "@/lib/slugs";
import { getSiteUrl } from "@/lib/site-url";
import { localBusinessJsonLd } from "@/lib/json-ld";

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
    include: { handymanProfile: true },
  });
  if (!user?.handymanProfile) return { title: "Majstor | Majstor.me" };
  const cat = user.handymanProfile.categories[0] || "Majstor";
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
      handymanProfile: true,
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user?.handymanProfile) notFound();

  const profile = user.handymanProfile;
  const profileExt = profile as {
    avatarUrl?: string | null;
    galleryImages?: string[];
    yearsOfExperience?: number | null;
    startingPrice?: number | null;
    completedJobsCount?: number;
    averageResponseMinutes?: number | null;
    availabilityStatus?: string | null;
    isPromoted?: boolean;
  };
  const avatarUrl = profileExt.avatarUrl;
  const galleryImages = profileExt.galleryImages ?? [];
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
  if (profile.categories.length > 0)
    createParams.set("category", profile.categories[0]);

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
    <div className="min-h-screen bg-[#F4F7FB] pb-28 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PremiumMobileHeader />
      <div className="mx-auto max-w-[430px] px-4 py-6 md:max-w-3xl md:px-6 md:py-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Nazad
        </Link>

        {/* Hero header */}
        <div className="rounded-[24px] border border-[#E7EDF5] bg-white p-[18px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[#E0F2FE] text-[#2563EB] shadow-[0_4px_14px_rgba(0,0,0,0.08)] sm:h-28 sm:w-28">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">
                  {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                </span>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-semibold text-[#0F172A] sm:text-2xl">{user.name}</h1>
                {isVerified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
                  </Badge>
                )}
                {profileExt.isPromoted && (
                  <Badge variant="outline" className="border-amber-400 text-amber-700">
                    <Award className="mr-1 h-3.5 w-3.5" /> Premium
                  </Badge>
                )}
              </div>
              {profile.categories.length > 0 && (
                <p className="mt-1 text-gray-600">{profile.categories.join(", ")}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 sm:justify-start">
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
              <div className="mt-4 flex flex-wrap gap-2">
                {profileExt.yearsOfExperience != null && (
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {profileExt.yearsOfExperience} god. iskustva
                  </span>
                )}
                {(profileExt.completedJobsCount ?? profile.reviewCount) > 0 && (
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {(profileExt.completedJobsCount ?? profile.reviewCount)} poslova
                  </span>
                )}
                {profileExt.availabilityStatus && (
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {AVAILABILITY_LABELS[profileExt.availabilityStatus] ?? profileExt.availabilityStatus}
                  </span>
                )}
              </div>
              {session?.user?.role === "USER" && (
                <Link href={`/request/create?${createParams}`} className="mt-6 block w-full sm:inline-block sm:w-auto">
                  <span className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.30)] sm:w-auto sm:px-6">
                    <MessageSquare className="h-5 w-5" />
                    Pošalji zahtjev
                  </span>
                </Link>
              )}
              {!session && (
                <p className="mt-4 text-sm text-gray-600">
                  <Link href={`/login?callbackUrl=/handyman/${user.id}`} className="font-medium text-blue-600 hover:underline">
                    Prijavite se
                  </Link>{" "}
                  da pošaljete zahtjev ovom majstoru.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
          {/* Galerija */}
          <div className="rounded-[20px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Galerija radova
            </h3>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {galleryImages.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  >
                    <img src={url} alt={`Rad ${idx + 1}`} className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">Nema slika u galeriji.</p>
            )}
          </div>

          {/* O meni */}
          <div className="rounded-[20px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <Briefcase className="h-5 w-5 text-blue-600" />
              O meni
            </h3>
            {profile.bio ? (
              <p className="text-gray-600">{profile.bio}</p>
            ) : (
              <p className="text-sm italic text-gray-500">Nema opisa.</p>
            )}
            {profile.cities.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Gradovi pokrivenosti</p>
                <div className="flex flex-wrap gap-2">
                  {profile.cities.map((c) => (
                    <Link
                      key={c}
                      href={`/grad/${cityToSlug(c)}`}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recenzije */}
          <div className="rounded-[20px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Recenzije
            </h3>
            {user.reviewsReceived.length === 0 ? (
              <p className="text-sm text-gray-500">Još nema recenzija.</p>
            ) : (
              <div className="space-y-4">
                {user.reviewsReceived.map((r) => {
                  const parts = r.reviewer.name?.trim().split(/\s+/) ?? [];
                  const initials = parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
                  return (
                    <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{initials}.</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("sr")}
                        </span>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {session?.user?.role === "USER" && (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E2E8F0] bg-[rgba(255,255,255,0.92)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-[16px] md:hidden">
          <Link
            href={`/request/create?${createParams}`}
            className="flex h-14 w-full items-center justify-center rounded-[16px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-lg font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)]"
          >
            Pošalji zahtjev
          </Link>
        </div>
      )}
    </div>
  );
}
