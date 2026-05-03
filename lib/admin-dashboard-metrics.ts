/**
 * Agregatne metrike admin dashboarda.
 * Keš: Next.js Data Cache (unstable_cache) — dijeljivo na serverlessu, za razliku od in-memory u modulu.
 */
import { unstable_cache } from "next/cache";
import { prismaWhereHandymanProfileActiveKpi } from "@/lib/admin/admin-handyman-filters";
import { prismaWhereHandymanProfileActiveTruth } from "@/lib/handyman-truth";

export type AdminDashboardData = {
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

async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; label: string; ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, label, ms: Date.now() - start };
}

async function loadAdminDashboardDataUncached(): Promise<AdminDashboardData> {
  const { prisma } = await import("@/lib/db");

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
  const requestsByDay = dayRanges.map(({ start, label }) => ({
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
    if (slowest) console.info("[AdminDashboard] Slowest query:", slowest.label, slowest.ms, "ms");
  }

  return {
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
}

/** KPI keš 60s — smanjuje opterećenje DB pri svakom otvaranju admina na serverlessu. */
export const getCachedAdminDashboardData = unstable_cache(
  async () => loadAdminDashboardDataUncached(),
  ["admin-dashboard-kpi-v1"],
  { revalidate: 60, tags: ["admin-dashboard"] }
);
