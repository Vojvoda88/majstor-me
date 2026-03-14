import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import {
  CheckCircle2,
  Star,
  MapPin,
  Wrench,
  MessageSquare,
  Briefcase,
  ImageIcon,
  MapPinned,
  MessageCircle,
} from "lucide-react";
import { cityToSlug } from "@/lib/slugs";

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
  return {
    title: `${user.name} - ${cat} ${city ? city : ""} | Majstor.me`.trim(),
    description: user.handymanProfile.bio || `Profil majstora ${user.name}`,
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
  const isVerified = profile.verifiedStatus === "VERIFIED";
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          ← Nazad
        </Link>

        {/* Header - avatar, ime, grad, kategorija, rating, recenzije */}
        <Card className="overflow-hidden rounded-2xl border-[#E2E8F0] shadow-card">
          <CardHeader className="bg-gradient-to-br from-[#F8FAFC] to-white pb-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Wrench className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <CardTitle className="text-xl font-bold text-[#0F172A] sm:text-2xl">
                    {user.name}
                  </CardTitle>
                  {isVerified && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verifikovan
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-[#64748B] sm:justify-start">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    {profile.ratingAvg.toFixed(1)}
                  </span>
                  <span>{profile.reviewCount} recenzija</span>
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.city}
                    </span>
                  )}
                </div>
                {profile.categories.length > 0 && (
                  <p className="mt-2 text-sm text-[#64748B]">
                    {profile.categories.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Opis usluga */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-[#0F172A]">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Opis usluga
              </h3>
              {profile.bio ? (
                <p className="mt-2 text-[#64748B]">{profile.bio}</p>
              ) : (
                <p className="mt-2 italic text-[#94A3B8]">
                  Nema opisa.
                </p>
              )}
            </section>

            {/* Galerija radova - placeholder */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-[#0F172A]">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Galerija radova
              </h3>
              <p className="mt-2 text-sm italic text-[#94A3B8]">
                Galerija uskoro.
              </p>
            </section>

            {/* Gradovi pokrivenosti */}
            {profile.cities.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-[#0F172A]">
                  <MapPinned className="h-5 w-5 text-blue-600" />
                  Gradovi pokrivenosti
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.cities.map((c) => (
                    <Link
                      key={c}
                      href={`/grad/${cityToSlug(c)}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-[#475569] hover:bg-slate-200"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recenzije */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-[#0F172A]">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Recenzije
              </h3>
              {user.reviewsReceived.length === 0 ? (
                <p className="mt-2 text-sm text-[#94A3B8]">
                  Još nema recenzija.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {user.reviewsReceived.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-[#64748B]">
                          {r.reviewer.name}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-sm text-[#475569]">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* CTA */}
            <div className="pt-4">
              <h3 className="mb-3 font-semibold text-[#0F172A]">
                Pošalji zahtjev
              </h3>
              {session?.user?.role === "USER" && (
                <Link href={`/request/create?${createParams}`}>
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    <MessageSquare className="h-5 w-5" />
                    Pošalji zahtjev
                  </Button>
                </Link>
              )}
              {!session && (
                <p className="text-sm text-[#64748B]">
                  <Link
                    href={`/login?callbackUrl=/handyman/${user.id}`}
                    className="font-medium text-[#2563EB] hover:underline"
                  >
                    Prijavite se
                  </Link>{" "}
                  kao korisnik da pošaljete zahtjev ovom majstoru.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
