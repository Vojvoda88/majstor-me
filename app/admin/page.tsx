import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminPermission("dashboard");
  const { prisma } = await import("@/lib/db");

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);

  const [
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
    recentAudits,
  ] = await Promise.all([
    prisma.request.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.request.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.handymanProfile.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.handymanProfile.count(),
    prisma.offer.count(),
    prisma.requestContactUnlock.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.creditTransaction.count({
      where: { createdAt: { gte: todayStart }, amount: { lt: 0 }, type: "CONTACT_UNLOCK" },
    }),
    prisma.creditTransaction.count({
      where: { createdAt: { gte: weekStart }, amount: { lt: 0 } },
    }),
    prisma.creditTransaction.count({
      where: { createdAt: { gte: monthStart }, amount: { lt: 0 } },
    }),
    prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "HANDYMAN" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true } },
        reportedUser: { select: { name: true } },
      },
    }),
    prisma.requestContactUnlock.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        handyman: { select: { name: true } },
        request: { select: { category: true, city: true } },
      },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
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
      return { label: start.toLocaleDateString("sr", { weekday: "short" }), count };
    })
  );

  const offersByDay = await Promise.all(
    [6, 5, 4, 3, 2, 1, 0].map(async (d) => {
      const start = new Date(now);
      start.setDate(start.getDate() - d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const count = await prisma.offer.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      return { label: start.toLocaleDateString("sr", { weekday: "short" }), count };
    })
  );

  const topCategories = await prisma.request.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 5,
  });

  const topCities = await prisma.request.groupBy({
    by: ["city"],
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: 5,
  });

  const maxBar = Math.max(1, ...requestsByDay.map((d) => d.count));
  const maxOffers = Math.max(1, ...offersByDay.map((d) => d.count));

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">Pregled platforme i ključnih metrika</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const card = (
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                {stat.sub && <p className="mt-0.5 text-xs text-[#94A3B8]">{stat.sub}</p>}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zahtjevi po danu (7 dana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end justify-between gap-2">
              {requestsByDay.map((d) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Ponude po danu (7 dana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end justify-between gap-2">
              {offersByDay.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-12 rounded-t bg-[#16A34A]"
                    style={{ height: `${(d.count / maxOffers) * 80}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs text-[#64748B]">{d.label}</span>
                  <span className="text-xs font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Najtraženije kategorije</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topCategories.map((c) => (
                <li key={c.category} className="flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-medium">{c._count.category}</span>
                </li>
              ))}
              {topCategories.length === 0 && <p className="text-sm text-[#64748B]">Nema podataka</p>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gradovi sa najviše aktivnosti</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topCities.map((c) => (
                <li key={c.city} className="flex justify-between text-sm">
                  <span>{c.city}</span>
                  <span className="font-medium">{c._count.city}</span>
                </li>
              ))}
              {topCities.length === 0 && <p className="text-sm text-[#64748B]">Nema podataka</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Zadnje aktivnosti na platformi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="mb-2 text-sm font-medium">Novi zahtjevi</h4>
              <ul className="space-y-1 text-sm">
                {recentRequests.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/requests/${r.id}`} className="hover:underline">
                      {r.category} – {r.city}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{new Date(r.createdAt).toLocaleDateString("sr")}</span>
                  </li>
                ))}
                {recentRequests.length === 0 && <p className="text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Novi majstori</h4>
              <ul className="space-y-1 text-sm">
                {recentHandymen.map((u) => (
                  <li key={u.id}>
                    <Link href={`/admin/handymen/${u.id}`} className="hover:underline">
                      {u.name}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString("sr")}</span>
                  </li>
                ))}
                {recentHandymen.length === 0 && <p className="text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Nove prijave</h4>
              <ul className="space-y-1 text-sm">
                {recentReports.map((r) => (
                  <li key={r.id}>
                    <Link href="/admin/moderation" className="hover:underline">
                      {r.reporter.name} → {r.reportedUser.name}
                    </Link>
                    <span className="ml-2 text-[#94A3B8]">{r.type}</span>
                  </li>
                ))}
                {recentReports.length === 0 && <p className="text-[#94A3B8]">Nema</p>}
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Otključanja kontakta</h4>
            <ul className="space-y-1 text-sm">
              {recentUnlocks.map((u) => (
                <li key={u.id}>
                  {u.handyman.name} – {u.request.category} ({u.request.city})
                  <span className="ml-2 text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString("sr")}</span>
                </li>
              ))}
              {recentUnlocks.length === 0 && <p className="text-[#94A3B8]">Nema</p>}
            </ul>
          </div>
          <div className="mt-6 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Admin akcije</h4>
            <ul className="space-y-1 text-sm">
              {recentAudits.map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.actionType}</span> {a.entityType} {a.entityId ?? ""}
                  <span className="ml-2 text-[#94A3B8]">{new Date(a.createdAt).toLocaleString("sr")}</span>
                </li>
              ))}
              {recentAudits.length === 0 && <p className="text-[#94A3B8]">Nema</p>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
