import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { prisma } = await import("@/lib/db");
  const [
    userCount,
    handymanCount,
    requestCount,
    openRequestCount,
    activeRequestCount,
    completedCount,
    reportCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.handymanProfile.count(),
    prisma.request.count(),
    prisma.request.count({ where: { status: "OPEN" } }),
    prisma.request.count({ where: { status: "IN_PROGRESS" } }),
    prisma.request.count({ where: { status: "COMPLETED" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Ukupno korisnika", value: userCount, href: "/admin/users" },
    { label: "Ukupno majstora", value: handymanCount, href: "/admin/handymen" },
    { label: "Aktivni zahtjevi", value: activeRequestCount, href: "/admin/requests?status=IN_PROGRESS" },
    { label: "Otvoreni zahtjevi", value: openRequestCount, href: "/admin/requests?status=OPEN" },
    { label: "Završeni poslovi", value: completedCount, href: "/admin/requests?status=COMPLETED" },
    { label: "Otvorene prijave", value: reportCount, href: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-description">Pregled platforme</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
