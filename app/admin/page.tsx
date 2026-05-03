import { AdminPushEntryCard } from "@/components/admin/admin-push-entry-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardData } from "@/lib/admin-dashboard-metrics";
import { getCachedAdminDashboardData } from "@/lib/admin-dashboard-metrics";
import Link from "next/link";

/** KPI iz keša (60s); layout je force-dynamic zbog auth — ova stranica koristi Data Cache za metrike. */
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const emptyData: AdminDashboardData = {
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

  let data: AdminDashboardData = emptyData;
  try {
    data = await getCachedAdminDashboardData();
  } catch (dataErr) {
    console.error("[AdminDashboard] Data load error:", dataErr);
    if (process.env.NODE_ENV === "development") throw dataErr;
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

  const requestsByDaySafe = Array.isArray(requestsByDay) ? requestsByDay : [];
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
    { label: "Prihod ovog meseca", value: creditsMonth, sub: "transakcije" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Početak</h1>
        <p className="mt-1 text-xs text-[#64748B] sm:text-sm">Pregled platforme i ključnih metrika</p>
      </div>

      <AdminPushEntryCard />

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
    </div>
  );
}
