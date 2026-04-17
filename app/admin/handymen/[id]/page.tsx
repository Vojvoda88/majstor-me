import { Prisma } from "@prisma/client";
import { requireAdminPermission } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AdminHandymanActions } from "./admin-handyman-actions";
import { DeleteUserButton } from "./delete-user-button";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
      avatarUrl: string | null;
      galleryImages: string[];
      viberPhone: string | null;
      whatsappPhone: string | null;
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
            avatarUrl: true,
            galleryImages: true,
            viberPhone: true,
            whatsappPhone: true,
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
  const reviewStatusLabel =
    hp.workerStatus === "PENDING_REVIEW"
      ? "Profil čeka pregled"
      : hp.workerStatus === "ACTIVE"
        ? "Profil je odobren"
        : hp.workerStatus === "SUSPENDED" || user.suspendedAt
          ? "Profil je suspendovan"
          : hp.workerStatus === "BANNED" || user.bannedAt
            ? "Profil je banovan"
            : "Status profila";
  const verificationLabel =
    hp.verifiedStatus === "VERIFIED"
      ? "Verifikovan"
      : hp.verifiedStatus === "REJECTED"
        ? "Verifikacija odbijena"
        : "Verifikacija na čekanju";

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

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Pregled odluke</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                hp.workerStatus === "ACTIVE"
                  ? "success"
                  : hp.workerStatus === "PENDING_REVIEW"
                    ? "outline"
                    : hp.workerStatus === "SUSPENDED" || user.suspendedAt
                      ? "secondary"
                      : "destructive"
              }
            >
              {reviewStatusLabel}
            </Badge>
            <Badge
              variant={
                hp.verifiedStatus === "VERIFIED"
                  ? "success"
                  : hp.verifiedStatus === "REJECTED"
                    ? "destructive"
                    : "secondary"
              }
            >
              {verificationLabel}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Šta admin pregleda</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Opis, kategorije, gradove i slike radova</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Ovaj blok služi da brzo odlučite da li profil može javno da se objavi ili treba dorada.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Javni status</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {hp.workerStatus === "ACTIVE"
                  ? "Vidljiv korisnicima"
                  : hp.workerStatus === "PENDING_REVIEW"
                    ? "Nije javno objavljen"
                    : "Ograničen pristup"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Dok nije aktivan, majstor ne treba da bude tretiran kao javno objavljen profil u katalogu.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sljedeća akcija</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {hp.workerStatus === "PENDING_REVIEW"
                  ? "Odobrite ili odbijte profil"
                  : hp.verifiedStatus !== "VERIFIED"
                    ? "Verifikujte nalog ako je pregled završen"
                    : "Nalog je spreman"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Akcije su gore desno. Verifikacija naloga je odvojena od odobrenja javnog profila.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <strong>Viber:</strong> {hp.viberPhone ?? "-"}
            </p>
            <p>
              <strong>WhatsApp:</strong> {hp.whatsappPhone ?? "-"}
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
              <strong>Ocena:</strong> {ratingDisplay} ({hp.reviewCount} recenzija)
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

      {(hp.avatarUrl || hp.galleryImages.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Fotografije profila</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hp.avatarUrl && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Profilna fotografija</p>
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border bg-slate-100">
                  <Image src={hp.avatarUrl} alt={user.name} fill className="object-cover" sizes="112px" />
                </div>
              </div>
            )}
            {hp.galleryImages.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Galerija radova</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {hp.galleryImages.map((url, idx) => (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square overflow-hidden rounded-xl border bg-slate-100"
                    >
                      <Image src={url} alt={`Rad ${idx + 1}`} fill className="object-cover" sizes="240px" />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
