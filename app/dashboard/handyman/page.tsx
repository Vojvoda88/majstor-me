import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandymanRequestList } from "./handyman-request-list";

const URGENCY_LABELS: Record<string, string> = {
  HITNO_DANAS: "Hitno danas",
  U_NAREDNA_2_DANA: "U naredna 2 dana",
  NIJE_HITNO: "Nije hitno",
};

export const metadata: Metadata = {
  title: "Dashboard majstora | Majstor.me",
  description: "Pregled otvorenih zahtjeva i slanje ponuda",
};

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

  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil majstora</CardTitle>
            <CardDescription>
              Morate ažurirati profil sa kategorijama prije nego što možete pregledati zahtjeve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/handyman/profile">
              <Button variant="default">Ažuriraj profil</Button>
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
      where.category = { in: profile.categories };
    }
    if (city) where.city = city;

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        user: { select: { name: true } },
        offers: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.request.count({ where }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="page-title">Dashboard majstora</h1>
      <p className="page-description">
        Pregledajte otvorene zahtjeve i pošaljite ponude
      </p>

      <HandymanRequestList
        requests={requests}
        profileCategories={profile.categories}
        profileCities={profile.cities}
        currentCategory={category}
        currentCity={city}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  );
}
