import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { city: true } } },
  });

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="rounded-2xl border-[#E2E8F0] shadow-card">
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
      where.category = { in: profile.categories };
    }
    if (city) where.city = city;
    // Bez city filtra: majstori vide sve zahtjeve; sa city: samo taj grad

  const handymanCity = profile.user?.city ?? null;
  const { getDistanceBetweenCities } = await import("@/lib/distance");

  const [requestsRaw, total, myOffersCount, acceptedCount] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        user: { select: { name: true } },
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

  // Sort by distance (closest first), then by createdAt
  let sorted = [...requestsRaw]
    .map((r) => ({
      ...r,
      _distance: handymanCity
        ? getDistanceBetweenCities(handymanCity, r.city)
        : 9999,
    }))
    .sort((a, b) => a._distance - b._distance || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const requests = sorted.slice(skip, skip + limit).map(({ _distance, ...r }) => r);
  const totalDisplayed = sorted.length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-[#64748B]">Otvoreni zahtjevi</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalDisplayed}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-[#64748B]">Moje poslate ponude</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{myOffersCount}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-[#64748B]">Prihvaćeni poslovi</p>
          <p className="mt-1 text-2xl font-bold text-[#16A34A]">{acceptedCount}</p>
        </div>
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
