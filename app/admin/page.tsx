import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { prisma } = await import("@/lib/db");

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    userCount,
    handymanCount,
    openRequestCount,
    activeRequestCount,
    completedCount,
    reportCount,
    reviewCount,
    offerCount,
    newUsersLast7d,
    newHandymenLast7d,
    newRequestsLast7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.handymanProfile.count(),
    prisma.request.count({ where: { status: "OPEN" } }),
    prisma.request.count({ where: { status: "IN_PROGRESS" } }),
    prisma.request.count({ where: { status: "COMPLETED" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
    prisma.offer.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.handymanProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.request.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const requestsByDay = await Promise.all(
    [6, 5, 4, 3, 2, 1, 0].map(async (d) => {
      const start = new Date(now);
      start.setDate(start.getDate() - d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const count = await prisma.request.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      const label = start.toLocaleDateString("sr", { weekday: "short" });
      return { label, count };
    })
  );

  const maxBar = Math.max(1, ...requestsByDay.map((d) => d.count));

  const stats: { label: string; value: number; href?: string; sub?: string }[] = [
    { label: "Ukupno korisnika", value: userCount, href: "/admin/users", sub: `+${newUsersLast7d} u 7 dana` },
    { label: "Ukupno majstora", value: handymanCount, href: "/admin/handymen", sub: `+${newHandymenLast7d} u 7 dana` },
    { label: "Aktivni zahtjevi", value: activeRequestCount, href: "/admin/requests?status=IN_PROGRESS" },
    { label: "Otvoreni zahtjevi", value: openRequestCount, href: "/admin/requests?status=OPEN" },
    { label: "Završeni poslovi", value: completedCount, href: "/admin/requests?status=COMPLETED", sub: `+${newRequestsLast7d} novih u 7 dana` },
    { label: "Recenzije", value: reviewCount },
    { label: "Ponude", value: offerCount },
    { label: "Otvorene prijave", value: reportCount, href: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-description">Pregled platforme i analitika</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const card = (
            <Card className="h-full transition-all hover:shadow-card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                {stat.sub && (
                  <p className="mt-0.5 text-xs text-[#94A3B8]">{stat.sub}</p>
                )}
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Zahtjevi po danu (posljednih 7)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-end justify-between gap-2">
            {requestsByDay.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-12 rounded-t bg-blue-500 transition-all"
                  style={{ height: `${(d.count / maxBar) * 80}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  title={`${d.count} zahtjeva`}
                />
                <span className="text-xs text-[#64748B]">{d.label}</span>
                <span className="text-xs font-medium text-[#0F172A]">{d.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
