import { requireAdminPermission } from "@/lib/admin/auth";
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
  recentRequests: Array<{ id: string; category: string; city: string; createdAt: Date }>;
  recentHandymen: Array<{ id: string; name: string | null; createdAt: Date }>;
  recentReports: Array<{ id: string; type: string; reporter: { name: string }; reportedUser: { name: string } }>;
  recentUnlocks: Array<{ id: string; createdAt: Date; handyman: { name: string }; request: { category: string; city: string } }>;
  requestsByDay: Array<{ label: string; count: number }>;
  topCategories: Array<{ category: string; _count: { category: number } }>;
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
    runTimed ? withTiming("requestsToday", () => prisma.request.count({ where: { createdAt: { gte: todayStart } } })) : prisma.request.count({ where: { createdAt: { gte: todayStart } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("requestsWeek", () => prisma.request.count({ where: { createdAt: { gte: weekStart } } })) : prisma.request.count({ where: { createdAt: { gte: weekStart } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("handymenToday", () => prisma.handymanProfile.count({ where: { createdAt: { gte: todayStart } } })) : prisma.handymanProfile.count({ where: { createdAt: { gte: todayStart } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("handymenActive", () => prisma.handymanProfile.count()) : prisma.handymanProfile.count().then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("offersCount", () => prisma.offer.count()) : prisma.offer.count().then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("contactUnlocksCount", () => prisma.requestContactUnlock.count()) : prisma.requestContactUnlock.count().then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("reportsPending", () => prisma.report.count({ where: { status: "PENDING" } })) : prisma.report.count({ where: { status: "PENDING" } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("creditsToday", () => prisma.creditTransaction.count({ where: { createdAt: { gte: todayStart }, amount: { lt: 0 }, type: "CONTACT_UNLOCK" } })) : prisma.creditTransaction.count({ where: { createdAt: { gte: todayStart }, amount: { lt: 0 }, type: "CONTACT_UNLOCK" } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("creditsWeek", () => prisma.creditTransaction.count({ where: { createdAt: { gte: weekStart }, amount: { lt: 0 } } })) : prisma.creditTransaction.count({ where: { createdAt: { gte: weekStart }, amount: { lt: 0 } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("creditsMonth", () => prisma.creditTransaction.count({ where: { createdAt: { gte: monthStart }, amount: { lt: 0 } } })) : prisma.creditTransaction.count({ where: { createdAt: { gte: monthStart }, amount: { lt: 0 } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("recentRequests", () => prisma.request.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } })) : prisma.request.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("recentHandymen", () => prisma.user.findMany({ where: { role: "HANDYMAN" }, take: 3, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } })) : prisma.user.findMany({ where: { role: "HANDYMAN" }, take: 3, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("recentReports", () => prisma.report.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { reporter: { select: { name: true } }, reportedUser: { select: { name: true } } } })) : prisma.report.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { reporter: { select: { name: true } }, reportedUser: { select: { name: true } } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("recentUnlocks", () => prisma.requestContactUnlock.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { handyman: { select: { name: true } }, request: { select: { category: true, city: true } } } })) : prisma.requestContactUnlock.findMany({ take: 3, orderBy: { createdAt: "desc" }, include: { handyman: { select: { name: true } }, request: { select: { category: true, city: true } } } }).then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed
      ? withTiming("requestsLast7Days", () =>
          prisma.request.findMany({
            where: { createdAt: { gte: dayRanges[0].start } },
            select: { createdAt: true },
          })
        )
      : prisma.request
          .findMany({
            where: { createdAt: { gte: dayRanges[0].start } },
            select: { createdAt: true },
          })
          .then((r) => ({ result: r, label: "", ms: 0 })),
    runTimed ? withTiming("topCategories", () => prisma.request.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } }, take: 5 })) : prisma.request.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } }, take: 5 }).then((r) => ({ result: r, label: "", ms: 0 })),
  ]);

  const getResult = (i: number): unknown => ("result" in all[i] ? (all[i] as { result: unknown }).result : all[i]);
  const requestsToday = getResult(0) as number;
  const requestsWeek = getResult(1) as number;
  const handymenToday = getResult(2) as number;
  const handymenActive = getResult(3) as number;
  const offersCount = getResult(4) as number;
  const contactUnlocksCount = getResult(5) as number;
  const reportsPending = getResult(6) as number;
  const creditsToday = getResult(7) as number;
  const creditsWeek = getResult(8) as number;
  const creditsMonth = getResult(9) as number;
  const recentRequests = getResult(10) as Awaited<ReturnType<typeof prisma.request.findMany>>;
  const recentHandymen = getResult(11) as Awaited<ReturnType<typeof prisma.user.findMany>>;
  const recentReports = getResult(12) as Array<{ id: string; type: string; reporter: { name: string }; reportedUser: { name: string } }>;
  const recentUnlocks = getResult(13) as Array<{ id: string; createdAt: Date; handyman: { name: string }; request: { category: string; city: string } }>;
  const requestsLast7 = getResult(14) as Array<{ createdAt: Date }>;
  const requestsByDay = dayRanges.map(({ start, end, label }) => ({
    label,
    count: requestsLast7.filter((r) => r.createdAt >= start && r.createdAt < end).length,
  }));
  const topCategories = getResult(15) as Awaited<ReturnType<typeof prisma.request.groupBy>>;

  if (runTimed && "ms" in all[0]) {
    const timings = all.slice(0, 16).filter((x) => typeof (x as { ms?: number }).ms === "number") as { result: unknown; label: string; ms: number }[];
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
    recentRequests,
    recentHandymen,
    recentReports,
    recentUnlocks,
    requestsByDay,
    topCategories,
  };

  dashboardCache = data;
  dashboardCacheTimestamp = Date.now();

  return data;
}

export default async function AdminDashboardPage() {
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
    recentRequests: [],
    recentHandymen: [],
    recentReports: [],
    recentUnlocks: [],
    requestsByDay: [],
    topCategories: [],
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
    recentRequests,
    recentHandymen,
    recentReports,
    recentUnlocks,
    requestsByDay,
    topCategories,
  } = data;

  function safeArray<T>(x: T[] | undefined | null): T[] {
    return Array.isArray(x) ? x : [];
  }
  const recentRequestsSafe = safeArray(recentRequests);
  const recentHandymenSafe = safeArray(recentHandymen);
  const recentReportsSafe = safeArray(recentReports);
  const recentUnlocksSafe = safeArray(recentUnlocks);
  const requestsByDaySafe = safeArray(requestsByDay);
  const topCategoriesSafe = safeArray(topCategories);

  const maxBar = Math.max(1, ...requestsByDaySafe.map((d) => d.count));

  const statCards = [
    { label: "Novi zahtjevi danas", value: requestsToday, href: "/admin/requests" },
    { label: "Novi zahtjevi ove sedmice", value: requestsWeek, href: "/admin/requests" },
    { label: "Novi majstori danas", value: handymenToday, href: "/admin/handymen" },
    { label: "Aktivni majstori", value: handymenActive, href: "/admin/handymen" },
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
        <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-xs text-[#64748B] sm:text-sm">Pregled platforme i ključnih metrika</p>
      </div>

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
        <Card>
          <CardHeader>
            <CardTitle>Najtraženije kategorije</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 sm:space-y-2">
              {topCategoriesSafe.map((c) => (
                <li key={c.category} className="flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-medium">{(c as { _count: { category: number } })._count.category}</span>
                </li>
              ))}
              {topCategoriesSafe.length === 0 && <p className="text-sm text-[#64748B]">Nema podataka</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Zadnje aktivnosti na platformi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="mb-2 text-sm font-medium">Novi zahtjevi</h4>
              <ul className="space-y-1.5 text-[13px] sm:text-sm">
                {recentRequestsSafe.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/requests/${r.id}`} className="hover:underline">
                      {r.category} – {r.city}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{new Date(r.createdAt).toLocaleDateString("sr")}</span>
                  </li>
                ))}
                {recentRequestsSafe.length === 0 && <p className="text-[13px] text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Novi majstori</h4>
              <ul className="space-y-1.5 text-[13px] sm:text-sm">
                {recentHandymenSafe.map((u) => (
                  <li key={u.id}>
                    <Link href={`/admin/handymen/${u.id}`} className="hover:underline">
                      {u.name}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString("sr")}</span>
                  </li>
                ))}
                {recentHandymenSafe.length === 0 && <p className="text-[13px] text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Nove prijave</h4>
              <ul className="space-y-1.5 text-[13px] sm:text-sm">
                {recentReportsSafe.map((r) => (
                  <li key={r.id}>
                    <Link href="/admin/moderation" className="hover:underline">
                      {r.reporter.name} → {r.reportedUser.name}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{r.type}</span>
                  </li>
                ))}
                {recentReportsSafe.length === 0 && <p className="text-[13px] text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
          </div>
          <div className="mt-5 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Otključanja kontakta</h4>
            <ul className="space-y-1.5 text-[13px] sm:text-sm">
              {recentUnlocksSafe.map((u) => (
                <li key={u.id}>
                  {u.handyman.name} – {u.request.category} ({u.request.city})
                  <span className="ml-2 text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString("sr")}</span>
                </li>
              ))}
              {recentUnlocksSafe.length === 0 && <p className="text-[13px] text-[#94A3B8]">Nema</p>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
