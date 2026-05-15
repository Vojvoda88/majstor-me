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
import { HandymanPendingReviewBanner } from "@/components/handyman/handyman-pending-review-banner";
import { SignOutButton } from "@/components/account/sign-out-button";
import { calcProfileCompletion } from "@/lib/handyman-onboarding";
import { isCreditsRequired, LOW_CREDITS_THRESHOLD } from "@/lib/credits";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/constants";
import { isPaymentConfigured } from "@/lib/payment";
import { HandymanCreditsCtaBlock } from "@/components/credits/handyman-credits-cta-block";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { VerifyEmailBanner } from "@/components/account/verify-email-banner";
import { withPerfLog } from "@/lib/perf";
import { headers } from "next/headers";
import { LOCALE_HEADER, normalizeLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/messages";

function isRequesterVerifiedUser(
  user: { emailVerified?: Date | null; phoneVerified?: Date | null } | null | undefined
): boolean {
  return (user?.emailVerified != null) || (user?.phoneVerified != null);
}

export const metadata: Metadata = {
  title: "Profil majstora",
  description: "Pregled otvorenih zahtjeva i slanje ponuda",
};

export const dynamic = "force-dynamic";

const URGENCY_TIER: Record<string, number> = {
  HITNO_DANAS: 0,
  U_NAREDNA_2_DANA: 1,
  NIJE_HITNO: 2,
};

export default async function HandymanDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; page?: string; urgency?: string }>;
}) {
  const session = await auth();
  const locale = normalizeLocale(headers().get(LOCALE_HEADER));
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const params = await searchParams;
  const category = params.category ?? "";
  const city = params.city ?? "";
  const urgency = params.urgency ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const candidateTake = Math.min(500, Math.max(skip + limit + 80, 120));

  const { prisma } = await import("@/lib/db");
  const [profileRaw, currentUser] = await withPerfLog("dashboard.handyman.profile_bundle", () =>
    Promise.all([
      prisma.handymanProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          user: { select: { city: true, phone: true } },
          workerCategories: { include: { category: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, email: true },
      }),
    ])
  );
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
            <CardTitle className="text-xl">{t(locale, "handymanDashboard.profileReceivedTitle", "Profil majstora")}</CardTitle>
            <CardDescription>
              {t(locale, "handymanDashboard.profileReceivedDescription", "Prijava je primljena. Popunite profil i sačuvajte.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/handyman/profile">
              <Button size="lg">{t(locale, "handymanDashboard.updateProfile", "Ažuriraj profil")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

    const where: Record<string, unknown> = {
      status: "OPEN",
      deletedAt: null,
      OR: [
        { adminStatus: "DISTRIBUTED" },
        { adminStatus: "HAS_OFFERS" },
        { adminStatus: "CONTACT_UNLOCKED" },
      ],
    };
    if (category) {
      where.category = category;
    } else if (profile.categories.length > 0) {
      where.AND = [
        { OR: (where.OR as unknown[]) },
        {
          OR: [
        { category: { in: profile.categories } },
        { category: REQUEST_CATEGORY_FALLBACK },
          ],
        },
      ];
      delete where.OR;
    }
    if (city) where.city = city;
    if (urgency && ["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"].includes(urgency)) {
      where.urgency = urgency;
    }
    // Bez city filtra: majstori vide sve zahtjeve; sa city: samo taj grad

  const handymanCity = profile.user?.city ?? null;
  const { getDistanceBetweenCities } = await import("@/lib/distance");

  const [requestsRaw, total, myOffersCount, acceptedCount] = await withPerfLog(
    "dashboard.handyman.requests_bundle",
    () =>
      Promise.all([
        prisma.request.findMany({
          where,
          select: {
            id: true,
            category: true,
            description: true,
            city: true,
            urgency: true,
            createdAt: true,
            requesterName: true,
            user: { select: { name: true, emailVerified: true, phoneVerified: true } },
            _count: { select: { offers: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: 0,
          take: candidateTake,
        }),
        prisma.request.count({ where }),
        prisma.offer.count({ where: { handymanId: session.user.id } }),
        prisma.offer.count({
          where: { handymanId: session.user.id, status: "ACCEPTED" },
        }),
      ])
  );

  function getFirstName(full: string | null | undefined): string {
    if (!full?.trim()) return "-";
    return full.trim().split(/\s+/)[0] ?? full;
  }

  // Sort: hitnost (HITNO_DANAS first) → distanca → createdAt desc
  let sorted = [...requestsRaw]
    .map((r) => ({
      ...r,
      _distance: handymanCity
        ? getDistanceBetweenCities(handymanCity, r.city)
        : 9999,
      _urgencyTier: URGENCY_TIER[r.urgency] ?? 2,
    }))
    .sort(
      (a, b) =>
        a._urgencyTier - b._urgencyTier ||
        a._distance - b._distance ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const requests = sorted.slice(skip, skip + limit).map(({ _distance, _urgencyTier, ...r }) => ({
    ...r,
    offersCount: r._count?.offers ?? 0,
    requesterDisplayName: getFirstName(r.requesterName ?? r.user?.name),
    isRequesterVerified: isRequesterVerifiedUser(
      r.user as { emailVerified?: Date | null; phoneVerified?: Date | null } | null
    ),
  }));
  const totalDisplayed = Math.min(total, candidateTake);

  const onboarding = calcProfileCompletion(profile, profile?.user);
  const pendingSteps = onboarding.steps.filter((step) => !step.done);
  const statusLabel =
    profile.workerStatus === "ACTIVE"
      ? t(locale, "handymanDashboard.statusActive", "Profil je aktivan")
      : profile.workerStatus === "PENDING_REVIEW"
        ? t(locale, "handymanDashboard.statusPending", "Čeka pregled admina")
        : t(locale, "handymanDashboard.statusInactive", "Profil trenutno nije aktivan");

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      {!currentUser?.emailVerified && <VerifyEmailBanner userEmail={currentUser?.email} />}
      {profile.workerStatus === "PENDING_REVIEW" && <HandymanPendingReviewBanner />}
      {onboarding.percent < 100 && (
        <OnboardingBanner percent={onboarding.percent} steps={onboarding.steps} className="mb-6" />
      )}
      <div className="mb-5">
        <HandymanPushNotificationsCard />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            {t(locale, "handymanDashboard.title", "Profil majstora")}
          </h1>
          <p className="mt-2 text-base text-[#64748B]">
            {t(locale, "handymanDashboard.subtitle", "Otvoreni zahtjevi i ponude na jednom mjestu")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/handyman/profile">
            <Button variant="outline" size="sm">
              {t(locale, "handymanDashboard.updateProfile", "Ažuriraj profil")}
            </Button>
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">{t(locale, "handymanDashboard.profileStatus", "Status profila")}</p>
            <h2 className="text-xl font-bold text-[#0F172A]">{statusLabel}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              {profile.workerStatus === "ACTIVE"
                ? t(locale, "handymanDashboard.activeDescription", "Profil je javno vidljiv.")
                : t(locale, "handymanDashboard.inactiveDescription", "Profil još nije javno objavljen.")}
            </p>
            {/* Verifikacijski status */}
            {profile.verifiedStatus === "VERIFIED" && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {t(locale, "handymanDashboard.verified", "Profil verifikovan")}
              </div>
            )}
            {profile.verifiedStatus === "PENDING" && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
                <Clock className="h-4 w-4" />
                {t(locale, "handymanDashboard.verificationPending", "Verifikacija u toku")}
              </div>
            )}
            {profile.verifiedStatus === "REJECTED" && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-200">
                <XCircle className="h-4 w-4" />
                {t(locale, "handymanDashboard.verificationRejected", "Verifikacija nije odobrena — kontaktirajte podršku")}
              </div>
            )}
          </div>
          <div className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t(locale, "handymanDashboard.nextStep", "Sledeći korak")}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {pendingSteps[0]?.label ?? t(locale, "handymanDashboard.profileComplete", "Profil je kompletiran.")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {pendingSteps.length > 0
                ? t(locale, "handymanDashboard.remainingSteps", "Preostalo još {count} stvari prije punijeg profila.").replace("{count}", String(pendingSteps.length))
                : t(locale, "handymanDashboard.allBasicsDone", "Svi osnovni elementi profila su popunjeni.")}
            </p>
            <Link href="/dashboard/handyman/profile" className="mt-3 inline-block">
              <Button size="sm" className="w-full">
                {t(locale, "handymanDashboard.openProfile", "Otvori profil i završi")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
          <p className="text-sm font-medium text-[#64748B]">{t(locale, "handymanDashboard.openRequests", "Otvoreni zahtjevi")}</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalDisplayed}</p>
        </div>
        <Link href="/dashboard/handyman/offers" className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 block">
          <p className="text-sm font-medium text-[#64748B]">{t(locale, "handymanDashboard.myOffers", "Moje poslane ponude")}</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{myOffersCount}</p>
          <p className="mt-1 text-xs font-medium text-blue-600">{t(locale, "handymanDashboard.viewAll", "Pogledaj sve")} →</p>
        </Link>
        <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
          <p className="text-sm font-medium text-[#64748B]">{t(locale, "handymanDashboard.acceptedJobs", "Prihvaćeni poslovi")}</p>
          <p className="mt-1 text-2xl font-bold text-[#16A34A]">{acceptedCount}</p>
        </div>
        <div id="credits" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md scroll-mt-24">
          <p className="text-sm font-medium text-[#64748B]">{t(locale, "handymanDashboard.credits", "Krediti")}</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{(profile as { creditsBalance?: number }).creditsBalance ?? 0}</p>
          {(profile as { creditsBalance?: number }).creditsBalance !== undefined &&
            ((profile as { creditsBalance?: number }).creditsBalance ?? 0) < LOW_CREDITS_THRESHOLD &&
            ((profile as { creditsBalance?: number }).creditsBalance ?? 0) > 0 && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              {t(locale, "handymanDashboard.lowCredits", "Malo kredita — dopunite prije nego što vam zatreba kontakt.")}
            </p>
          )}
          <Link
            href="/dashboard/handyman/credits"
            className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            {isPaymentConfigured() ? `${t(locale, "handymanDashboard.buyCredits", "Kupi kredite")} →` : `${t(locale, "handymanDashboard.activateCredits", "Aktiviraj kredite")} →`}
          </Link>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {isCreditsRequired()
              ? t(locale, "handymanDashboard.creditsPolicy", "Obično 200–400 kredita po kontaktu")
              : t(locale, "handymanDashboard.creditsFreeEnv", "U ovom okruženju kontakt može biti bez kredita")}
          </p>
        </div>
      </div>

      {isCreditsRequired() && (
        <div className="mt-6">
          <HandymanCreditsCtaBlock paymentOnline={isPaymentConfigured()} />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-blue-700">Kako radi za majstore</h2>
        <div className="mt-3 grid gap-2.5 text-sm text-slate-700 md:grid-cols-3">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <strong>1.</strong> Popunite profil i kategorije.
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <strong>2.</strong> Stižu vam obavještenja za relevantne poslove.
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <strong>3.</strong> Otključate kontakt samo kad želite.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/kako-radi-majstori" className="font-semibold text-blue-600 hover:underline">
            Kako radi za majstore →
          </Link>
          <Link href="/kako-radi-majstori#krediti" className="font-semibold text-blue-600 hover:underline">
            Kako rade krediti →
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0F172A]">{t(locale, "handymanDashboard.systemTitle", "Kako radi sistem")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {t(locale, "handymanDashboard.systemIntro", "Klijenti objavljaju zahtjeve — vi ih vidite na listi.")}
          {" "}
          {t(locale, "handymanDashboard.phoneHidden", "Broj telefona ne vidite odmah.")}
        </p>
        {isCreditsRequired() ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {t(locale, "handymanDashboard.creditsExplanation", "Krediti su način da otključate kontakt.")}
              {" "}
              {t(locale, "handymanDashboard.refundPolicy", "Povrat kredita postoji u posebnim slučajevima.")}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Sve opcije za dopunu (online i keš) su na{" "}
              <Link href="/dashboard/handyman/credits" className="font-semibold text-blue-600 underline underline-offset-2">
                {t(locale, "handymanDashboard.creditsPage", "stranici Krediti")}
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
        currentUrgency={urgency}
        total={totalDisplayed}
        page={page}
        limit={limit}
      />
    </div>
  );
}
