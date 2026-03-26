import { Prisma } from "@prisma/client";
import { requireAdminPermission } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AdminHandymanActions } from "./admin-handyman-actions";
import { DeleteUserButton } from "./delete-user-button";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

export default async function AdminHandymanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { adminRole } = await requireAdminPermission("workers");
  const { id } = await params;

  let user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    suspendedAt: Date | null;
    bannedAt: Date | null;
    handymanProfile: {
      verifiedStatus: string;
      workerStatus: string;
      cities: string[];
      creditsBalance: number;
      completedJobsCount: number;
      ratingAvg: number;
      reviewCount: number;
      bio: string | null;
      workerCategories: { category: { name: string } }[];
    } | null;
    offers: {
      id: string;
      requestId: string;
      status: string;
      request: { id: string; category: string; city: string };
    }[];
    _count: { offers: number; contactUnlocks: number };
  } | null = null;

  let creditTx: {
    id: string;
    createdAt: Date;
    type: string;
    amount: number;
    balanceAfter: number;
  }[] = [];

  try {
    const { prisma } = await import("@/lib/db");
    console.info("[AdminHandymanDetailSSR] query_user_start", { id });

    user = await prisma.user.findUnique({
      where: { id, role: "HANDYMAN" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        suspendedAt: true,
        bannedAt: true,
        handymanProfile: {
          select: {
            verifiedStatus: true,
            workerStatus: true,
            cities: true,
            creditsBalance: true,
            completedJobsCount: true,
            ratingAvg: true,
            reviewCount: true,
            bio: true,
            workerCategories: {
              select: { category: { select: { name: true } } },
            },
          },
        },
        offers: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            requestId: true,
            status: true,
            request: { select: { id: true, category: true, city: true } },
          },
        },
        _count: {
          select: { offers: true, contactUnlocks: true },
        },
      },
    });

    console.info("[AdminHandymanDetailSSR] query_user_ok", { id, found: !!user });

    if (user?.handymanProfile) {
      console.info("[AdminHandymanDetailSSR] query_credit_tx_start", { id });
      creditTx = await prisma.creditTransaction.findMany({
        where: { handymanId: id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          createdAt: true,
          type: true,
          amount: true,
          balanceAfter: true,
        },
      });
      console.info("[AdminHandymanDetailSSR] query_credit_tx_ok", { id, n: creditTx.length });
    }
  } catch (e) {
    const code = prismaErrorCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[AdminHandymanDetailSSR] fatal", {
      id,
      phase: "page_data",
      prismaCode: code,
      message: msg,
      stack: e instanceof Error ? e.stack : undefined,
      prismaMeta: e instanceof Prisma.PrismaClientKnownRequestError ? e.meta : undefined,
    });
    return (
      <AdminRouteLoadError
        routeTitle="Majstor"
        cardTitle="Učitavanje majstora nije uspjelo"
        logPrefix="[AdminHandymanDetailSSR]"
        message={msg}
        code={code}
        snapshot={{ id }}
        resetHref="/admin/handymen"
        resetLabel="Nazad na listu majstora"
      />
    );
  }

  if (!user?.handymanProfile) notFound();

  const hp = user.handymanProfile;
  const categories = hp.workerCategories.map((wc) => wc.category.name);
  const ratingDisplay = Number(hp.ratingAvg ?? 0).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{user.name}</h1>
          <p className="mt-1 text-sm text-[#64748B]">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminHandymanActions
            handymanId={id}
            adminRole={adminRole}
            verifiedStatus={hp.verifiedStatus}
            workerStatus={hp.workerStatus}
            suspendedAt={user.suspendedAt}
            bannedAt={user.bannedAt}
          />
          <DeleteUserButton userId={id} label="Obriši nalog (majstora)" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Telefon:</strong> {user.phone ?? "-"}
            </p>
            <p>
              <strong>Grad:</strong> {user.city ?? hp.cities[0] ?? "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {hp.workerStatus === "BANNED" || user.bannedAt
                ? "Banned"
                : hp.workerStatus === "SUSPENDED" || user.suspendedAt
                  ? "Suspendovan"
                  : hp.workerStatus === "PENDING_REVIEW"
                    ? "Na čekanju"
                    : "Aktivan"}
            </p>
            <p>
              <strong>Verifikacija:</strong> {hp.verifiedStatus}
            </p>
            <p>
              <strong>Kategorije:</strong> {categories.join(", ") || "-"}
            </p>
            <p>
              <strong>Gradovi rada:</strong> {hp.cities.join(", ") || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Krediti:</strong> {hp.creditsBalance}
            </p>
            <p>
              <strong>Ponude:</strong> {user._count.offers}
            </p>
            <p>
              <strong>Otključanja kontakta:</strong> {user._count.contactUnlocks}
            </p>
            <p>
              <strong>Završeni poslovi:</strong> {hp.completedJobsCount}
            </p>
            <p>
              <strong>Ocjena:</strong> {ratingDisplay} ({hp.reviewCount} recenzija)
            </p>
          </CardContent>
        </Card>
      </div>

      {hp.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Opis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{hp.bio}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kreditna istorija</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4">Datum</th>
                  <th className="pb-2 pr-4">Tip</th>
                  <th className="pb-2 pr-4">Iznos</th>
                  <th className="pb-2 pr-4">Stanje</th>
                </tr>
              </thead>
              <tbody>
                {creditTx.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleString("sr")}</td>
                    <td className="py-2 pr-4">{t.type}</td>
                    <td className={`py-2 pr-4 ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {t.amount >= 0 ? "+" : ""}
                      {t.amount}
                    </td>
                    <td className="py-2 pr-4">{t.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {creditTx.length === 0 && <p className="py-4 text-[#64748B]">Nema transakcija</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ponude</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {user.offers.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/requests/${o.requestId}`} className="hover:underline">
                  {o.request.category} – {o.request.city}
                </Link>
                <span className="ml-2 text-[#64748B]">{o.status}</span>
              </li>
            ))}
          </ul>
          {user.offers.length === 0 && <p className="text-[#64748B]">Nema ponuda</p>}
        </CardContent>
      </Card>
    </div>
  );
}
