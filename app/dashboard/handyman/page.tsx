import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandymanRequestList } from "./handyman-request-list";
import { OnboardingBanner } from "@/components/handyman/onboarding-banner";
import { HandymanPushNotificationsCard } from "@/components/handyman/push-notifications-card";
import { calcProfileCompletion } from "@/lib/handyman-onboarding";
import { isCreditsRequired, LOW_CREDITS_THRESHOLD } from "@/lib/credits";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/constants";
import { isPaymentConfigured } from "@/lib/payment";
import { HandymanCreditsCtaBlock } from "@/components/credits/handyman-credits-cta-block";

function isRequesterVerifiedUser(
  user: { emailVerified?: Date | null; phoneVerified?: Date | null } | null | undefined
): boolean {
  return (user?.emailVerified != null) || (user?.phoneVerified != null);
}

export const metadata: Metadata = {
  title: "Dashboard majstora",
  description: "Pregled otvorenih zahtjeva i slanje ponuda",
};

export const dynamic = "force-dynamic";

export default async function HandymanDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const params = await searchParams;
  const category = params.category ?? "";
  const city = params.city ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/db");
  const profileRaw = await prisma.handymanProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { city: true, phone: true } },
      workerCategories: { include: { category: true } },
    },
  });
  const profile = profileRaw
    ? {
        ...profileRaw,
        categories: profileRaw.workerCategories.map((wc) => wc.category.name),
      }
    : null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Card className="rounded-xl bg-white shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Profil majstora</CardTitle>
            <CardDescription>
              Izaberite kategorije i gradove u kojima nudite usluge prije nego što možete pregledati zahtjeve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/handyman/profile">
              <Button size="lg">Ažuriraj profil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

    const where: Record<string, unknown> = { status: "OPEN" };
    if (category) {
      where.category = category;
    } else if (profile.categories.length > 0) {
      where.OR = [
        { category: { in: profile.categories } },
        { category: REQUEST_CATEGORY_FALLBACK },
      ];
    }
    if (city) where.city = city;
    // Bez city filtra: majstori vide sve zahtjeve; sa city: samo taj grad

  const handymanCity = profile.user?.city ?? null;
  const { getDistanceBetweenCities } = await import("@/lib/distance");

  const [requestsRaw, total, myOffersCount, acceptedCount] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        user: { select: { name: true, emailVerified: true, phoneVerified: true } },
        offers: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 500,
    }),
    prisma.request.count({ where }),
    prisma.offer.count({ where: { handymanId: session.user.id } }),
    prisma.offer.count({
      where: { handymanId: session.user.id, status: "ACCEPTED" },
    }),
  ]);

  function getFirstName(full: string | null | undefined): string {
    if (!full?.trim()) return "-";
    return full.trim().split(/\s+/)[0] ?? full;
  }

  // Sort by distance (closest first), then by createdAt
  let sorted = [...requestsRaw]
    .map((r) => ({
      ...r,
      _distance: handymanCity
        ? getDistanceBetweenCities(handymanCity, r.city)
        : 9999,
    }))
    .sort((a, b) => a._distance - b._distance || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const requests = sorted.slice(skip, skip + limit).map(({ _distance, ...r }) => ({
    ...r,
    requesterDisplayName: getFirstName(r.requesterName ?? r.user?.name),
    isRequesterVerified: isRequesterVerifiedUser(
      r.user as { emailVerified?: Date | null; phoneVerified?: Date | null } | null
    ),
  }));
  const totalDisplayed = sorted.length;

  const onboarding = calcProfileCompletion(profile, profile?.user);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {onboarding.percent < 100 && (
        <OnboardingBanner percent={onboarding.percent} steps={onboarding.steps} className="mb-6" />
      )}
      <div className="mb-6">
        <HandymanPushNotificationsCard />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Dashboard majstora
          </h1>
          <p className="mt-2 text-base text-[#64748B]">
            Pregledajte otvorene zahtjeve i pošaljite ponude
          </p>
        </div>
        <Link href="/dashboard/handyman/profile">
          <Button variant="outline" size="sm">
            Ažuriraj profil
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
          <p className="text-sm font-medium text-[#64748B]">Otvoreni zahtjevi</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalDisplayed}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
          <p className="text-sm font-medium text-[#64748B]">Moje poslate ponude</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{myOffersCount}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
          <p className="text-sm font-medium text-[#64748B]">Prihvaćeni poslovi</p>
          <p className="mt-1 text-2xl font-bold text-[#16A34A]">{acceptedCount}</p>
        </div>
        <div id="credits" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md scroll-mt-24">
          <p className="text-sm font-medium text-[#64748B]">Krediti</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{(profile as { creditsBalance?: number }).creditsBalance ?? 0}</p>
          {(profile as { creditsBalance?: number }).creditsBalance !== undefined &&
            ((profile as { creditsBalance?: number }).creditsBalance ?? 0) < LOW_CREDITS_THRESHOLD &&
            ((profile as { creditsBalance?: number }).creditsBalance ?? 0) > 0 && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              Malo kredita — dopunite prije nego što vam zatreba kontakt.
            </p>
          )}
          <Link
            href="/dashboard/handyman/credits"
            className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            {isPaymentConfigured() ? "Kupi kredite →" : "Aktiviraj kredite →"}
          </Link>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {isCreditsRequired()
              ? "Obično 200–400 kredita po kontaktu (hitnost + detalji; max oko 650 sa dodacima)"
              : "U ovom okruženju kontakt može biti bez kredita"}
          </p>
        </div>
      </div>

      {isCreditsRequired() && (
        <div className="mt-6">
          <HandymanCreditsCtaBlock paymentOnline={isPaymentConfigured()} />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0F172A]">Kako radi sistem</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Klijenti objavljaju zahtjeve — vi ih vidite na listi. Pregled opisa, grada, kategorije i slika je{" "}
          <strong className="font-semibold text-[#0F172A]">besplatan</strong>.{" "}
          <strong className="font-semibold text-[#0F172A]">Broj telefona ne vidite odmah</strong>: dobijate ga tek kad
          potvrdite da želite kontakt za taj posao.
        </p>
        {isCreditsRequired() ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              <strong className="font-semibold text-[#0F172A]">Krediti</strong> su način da otključate kontakt. Troše se
              samo u tom trenutku (obično 200–400 za hitnost + dodatci). Nakon otključavanja možete poslati ponudu ili pozvati klijenta. Povrat
              kredita postoji ako admin označi spam ili zaobilaženje, ili zbog tehničke greške — ne ako se korisnik ne
              javi.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Sve opcije za dopunu (online i keš) su na{" "}
              <Link href="/dashboard/handyman/credits" className="font-semibold text-blue-600 underline underline-offset-2">
                stranici Krediti
              </Link>
              .
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            U ovom okruženju otključavanje kontakta je trenutno bez kredita — i dalje potvrdite kontakt prije nego što
            vidite broj telefona.
          </p>
        )}
      </div>

      <HandymanRequestList
        requests={requests}
        profileCategories={profile.categories}
        profileCities={profile.cities}
        currentCategory={category}
        currentCity={city}
        total={totalDisplayed}
        page={page}
        limit={limit}
      />
    </div>
  );
}
