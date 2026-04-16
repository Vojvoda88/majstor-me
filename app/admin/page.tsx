import { prismaWhereHandymanProfileActiveKpi } from "@/lib/admin/admin-handyman-filters";
import { prismaWhereHandymanProfileActiveTruth } from "@/lib/handyman-truth";
import { getAdminPendingReviewCounts } from "@/lib/admin-pending-counts";
import { AdminPushEntryCard } from "@/components/admin/admin-push-entry-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DashboardData = {
  requestsToday: number;
  requestsWeek: number;
  handymenToday: number;
  handymenActive: number;
  offersCount: number;
  contactUnlocksCount: number;
  reportsPending: number;
  creditsToday: number;
  creditsWeek: number;
  creditsMonth: number;
  requestsByDay: Array<{ label: string; count: number }>;
};

let dashboardCache: DashboardData | null = null;
let dashboardCacheTimestamp = 0;
const DASHBOARD_CACHE_TTL_MS = 60_000;

async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; label: string; ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, label, ms: Date.now() - start };
}

async function loadDashboardData() {
  const { prisma } = await import("@/lib/db");

  if (dashboardCache && Date.now() - dashboardCacheTimestamp < DASHBOARD_CACHE_TTL_MS) {
    return dashboardCache;
  }
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);

  const dayRanges = ([6, 5, 4, 3, 2, 1, 0] as const).map((d) => {
    const start = new Date(now);
    start.setDate(start.getDate() - d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end, label: start.toLocaleDateString("sr", { weekday: "short" }) };
  });

  const runTimed = process.env.NODE_ENV === "development" || process.env.ADMIN_DASHBOARD_TIMING === "1";

  const all = await Promise.all([
    runTimed
      ? withTiming("handymenToday", () =>
          prisma.handymanProfile.count({
            where: {
              createdAt: { gte: todayStart },
              ...prismaWhereHandymanProfileActiveTruth(),
            },
          })
        )
      : prisma.handymanProfile
          .count({
            where: {
              createdAt: { gte: todayStart },
              ...prismaWhereHandymanProfileActiveTruth(),
            },
          })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("handymenActive", () =>
          prisma.handymanProfile.count({ where: prismaWhereHandymanProfileActiveKpi() })
        )
      : prisma.handymanProfile
          .count({ where: prismaWhereHandymanProfileActiveKpi() })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("offersCount", () => prisma.offer.count())
      : prisma.offer.count().then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("contactUnlocksCount", () => prisma.requestContactUnlock.count())
      : prisma.requestContactUnlock.count().then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("reportsPending", () => prisma.report.count({ where: { status: "PENDING" } }))
      : prisma.report.count({ where: { status: "PENDING" } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("creditsToday", () =>
          prisma.creditTransaction.count({
            where: { createdAt: { gte: todayStart }, amount: { lt: 0 }, type: "CONTACT_UNLOCK" },
          })
        )
      : prisma.creditTransaction
          .count({ where: { createdAt: { gte: todayStart }, amount: { lt: 0 }, type: "CONTACT_UNLOCK" } })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("creditsWeek", () =>
          prisma.creditTransaction.count({ where: { createdAt: { gte: weekStart }, amount: { lt: 0 } } })
        )
      : prisma.creditTransaction
          .count({ where: { createdAt: { gte: weekStart }, amount: { lt: 0 } } })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("creditsMonth", () =>
          prisma.creditTransaction.count({ where: { createdAt: { gte: monthStart }, amount: { lt: 0 } } })
        )
      : prisma.creditTransaction
          .count({ where: { createdAt: { gte: monthStart }, amount: { lt: 0 } } })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("requestsByDay", () =>
          prisma.$queryRaw<Array<{ day: Date; count: bigint | number }>>`
            SELECT date_trunc('day', "created_at") AS day, COUNT(*) AS count
            FROM "requests"
            WHERE "created_at" >= ${dayRanges[0].start}
            GROUP BY 1
          `
        )
      : prisma.$queryRaw<Array<{ day: Date; count: bigint | number }>>`
          SELECT date_trunc('day', "created_at") AS day, COUNT(*) AS count
          FROM "requests"
          WHERE "created_at" >= ${dayRanges[0].start}
          GROUP BY 1
        `.then((r) => ({ result: r, label: "", ms: 0 })),
  ]);

  const getResult = (i: number): unknown => ("result" in all[i] ? (all[i] as { result: unknown }).result : all[i]);
  const handymenToday = getResult(0) as number;
  const handymenActive = getResult(1) as number;
  const offersCount = getResult(2) as number;
  const contactUnlocksCount = getResult(3) as number;
  const reportsPending = getResult(4) as number;
  const creditsToday = getResult(5) as number;
  const creditsWeek = getResult(6) as number;
  const creditsMonth = getResult(7) as number;
  const requestsByDayRows = getResult(8) as Array<{ day: Date; count: bigint | number }>;
  const requestsByDayMap = new Map(
    requestsByDayRows.map((r) => [new Date(r.day).toDateString(), Number(r.count)])
  );
  const requestsByDay = dayRanges.map(({ start, end, label }) => ({
    label,
    count: requestsByDayMap.get(start.toDateString()) ?? 0,
  }));
  const requestsToday = requestsByDay.at(-1)?.count ?? 0;
  const requestsWeek = requestsByDay.reduce((sum, d) => sum + d.count, 0);

  if (runTimed && "ms" in all[0]) {
    const timings = all
      .slice(0, 9)
      .filter((x) => typeof (x as { ms?: number }).ms === "number") as { result: unknown; label: string; ms: number }[];
    const slowest = timings.length ? timings.reduce((a, b) => (a.ms >= b.ms ? a : b)) : null;
    console.info("[AdminDashboard] Query batch total (wall) ms:", Date.now() - (typeof (global as unknown as { __adminDashboardStart?: number }).__adminDashboardStart === "number" ? (global as unknown as { __adminDashboardStart: number }).__adminDashboardStart : 0));
    if (slowest) console.info("[AdminDashboard] Slowest query:", slowest.label, slowest.ms, "ms");
  }

  const data: DashboardData = {
    requestsToday,
    requestsWeek,
    handymenToday,
    handymenActive,
    offersCount,
    contactUnlocksCount,
    reportsPending,
    creditsToday,
    creditsWeek,
    creditsMonth,
    requestsByDay,
  };

  dashboardCache = data;
  dashboardCacheTimestamp = Date.now();

  return data;
}

export default async function AdminDashboardPage() {
  let pendingStrip = { pendingRequests: 0, pendingHandymen: 0, urgentPendingRequests: 0 };
  try {
    pendingStrip = await getAdminPendingReviewCounts();
  } catch {
    /* ignore */
  }

  const emptyData: Awaited<ReturnType<typeof loadDashboardData>> = {
    requestsToday: 0,
    requestsWeek: 0,
    handymenToday: 0,
    handymenActive: 0,
    offersCount: 0,
    contactUnlocksCount: 0,
    reportsPending: 0,
    creditsToday: 0,
    creditsWeek: 0,
    creditsMonth: 0,
    requestsByDay: [],
  };

  let data: Awaited<ReturnType<typeof loadDashboardData>> = emptyData;
  try {
    data = await loadDashboardData();
  } catch (dataErr) {
    console.error("[AdminDashboard] Data load error:", dataErr);
    console.error("[AdminDashboard] Data stack:", dataErr instanceof Error ? dataErr.stack : "no stack");
    console.error("[AdminDashboard] Data message:", dataErr instanceof Error ? dataErr.message : String(dataErr));
    // U produkciji ne rušimo cijeli dashboard – prikažemo prazan state umjesto toga.
    if (process.env.NODE_ENV !== "development") {
      console.error("[AdminDashboard] Falling back to empty dashboard data in production.");
    } else {
      throw dataErr;
    }
  }

  const {
    requestsToday,
    requestsWeek,
    handymenToday,
    handymenActive,
    offersCount,
    contactUnlocksCount,
    reportsPending,
    creditsToday,
    creditsWeek,
    creditsMonth,
    requestsByDay,
  } = data;

  function safeArray<T>(x: T[] | undefined | null): T[] {
    return Array.isArray(x) ? x : [];
  }
  const requestsByDaySafe = safeArray(requestsByDay);

  const maxBar = Math.max(1, ...requestsByDaySafe.map((d) => d.count));

  const statCards = [
    { label: "Novi zahtjevi danas", value: requestsToday, href: "/admin/requests" },
    { label: "Novi zahtjevi ove sedmice", value: requestsWeek, href: "/admin/requests" },
    { label: "Novi majstori danas", value: handymenToday, href: "/admin/handymen", sub: "profili reg. danas, bez test emaila" },
    {
      label: "Aktivni majstori",
      value: handymenActive,
      href: "/admin/handymen?status=ACTIVE",
      sub: "ACTIVE + javno vidljivi (nije demo)",
    },
    { label: "Poslane ponude", value: offersCount, href: "/admin/offers" },
    { label: "Otključanja kontakta", value: contactUnlocksCount },
    { label: "Prijave na čekanju", value: reportsPending, href: "/admin/moderation" },
    { label: "Prihod od kredita danas", value: creditsToday, sub: "otključanja" },
    { label: "Prihod ove sedmice", value: creditsWeek, sub: "transakcije" },
    { label: "Prihod ovog mjeseca", value: creditsMonth, sub: "transakcije" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Početak</h1>
        <p className="mt-1 text-xs text-[#64748B] sm:text-sm">Pregled platforme i ključnih metrika</p>
      </div>

      <AdminPushEntryCard />

      {(pendingStrip.pendingRequests > 0 || pendingStrip.pendingHandymen > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/requests?adminStatus=PENDING_REVIEW">
            <Card className="h-full border-amber-200 bg-amber-50/90 transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold text-amber-950">Zahtjevi na pregled</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-950">{pendingStrip.pendingRequests}</p>
                {pendingStrip.urgentPendingRequests > 0 && (
                  <p className="mt-1 text-xs font-medium text-red-700">
                    Hitno (danas): {pendingStrip.urgentPendingRequests}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/handymen?status=PENDING_REVIEW">
            <Card className="h-full border-sky-200 bg-sky-50/90 transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold text-sky-950">Majstori na pregled</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-sky-950">{pendingStrip.pendingHandymen}</p>
                <p className="mt-1 text-xs text-sky-800">Nova prijava ili profil na čekanju</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const card = (
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs font-medium text-[#64748B] sm:text-sm">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-[#0F172A] sm:text-2xl">{stat.value}</p>
                {stat.sub && <p className="mt-0.5 text-[11px] text-[#94A3B8] sm:text-xs">{stat.sub}</p>}
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Zahtjevi po danu (7 dana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end justify-between gap-1 sm:gap-2">
              {requestsByDaySafe.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-12 rounded-t bg-[#2563EB]"
                    style={{ height: `${(d.count / maxBar) * 80}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs text-[#64748B]">{d.label}</span>
                  <span className="text-xs font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        {/* Secondary analytics and recent activity blokovi su uklonjeni iz prvog SSR rendera da bi critical path ostao samo na KPI i osnovnom chartu. */}
      </div>
    </div>
  );
}
