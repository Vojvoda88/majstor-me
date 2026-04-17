import { requireAdminPermission } from "@/lib/admin/auth";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import {
  adminPaginationPage,
  firstQueryString,
  prismaErrorCode,
  resolveAdminSearchParams,
} from "@/lib/admin/admin-ssr-params";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { prismaWhereAdminHandymanUserBase } from "@/lib/admin/admin-handyman-filters";
import { ADMIN_HANDYMAN_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type HandymenSnapshot = {
  statusFilter?: string;
  cityFilter?: string;
  searchQ?: string;
  page: number;
};

export default async function AdminHandymenPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  await requireAdminPermission("workers");

  let snapshot: HandymenSnapshot = { page: 1 };

  try {
    const { prisma } = await import("@/lib/db");
    const raw = await resolveAdminSearchParams(searchParams);
    const statusFilter = firstQueryString(raw.status);
    const cityFilter = firstQueryString(raw.city);
    const searchQ = firstQueryString(raw.search)?.trim();
    const { page, skip, take } = adminPaginationPage(firstQueryString(raw.page), PAGE_SIZE);

    snapshot = {
      statusFilter,
      cityFilter,
      searchQ: searchQ || undefined,
      page,
    };

    if (process.env.ADMIN_HANDYMEN_DEBUG === "1") {
      console.warn("[AdminHandymenSSR] start", snapshot);
    }

    const where: Prisma.UserWhereInput = {
      ...prismaWhereAdminHandymanUserBase(),
    };
    if (statusFilter && ["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "BANNED"].includes(statusFilter)) {
      where.handymanProfile = {
        workerStatus: statusFilter as "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "BANNED",
      };
    }
    if (cityFilter) where.city = cityFilter;
    if (searchQ) {
      where.OR = [
        { name: { contains: searchQ, mode: "insensitive" } },
        { phone: { contains: searchQ, mode: "insensitive" } },
        { email: { contains: searchQ, mode: "insensitive" } },
      ];
    }

    let handymen;
    let total: number;

    try {
      [handymen, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: ADMIN_HANDYMAN_LIST_SELECT,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.user.count({ where }),
      ]);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[AdminHandymenSSR] prisma.user findMany/count failed", {
        snapshot,
        message: err.message,
        name: err.name,
      });
      throw err;
    }

    const withProfile = handymen.filter((h) => h.handymanProfile);
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const baseQuery = new URLSearchParams();
    if (statusFilter) baseQuery.set("status", statusFilter);
    if (cityFilter) baseQuery.set("city", cityFilter);
    if (searchQ) baseQuery.set("search", searchQ);
    const queryStr = baseQuery.toString();
    const pageLink = (p: number) => `/admin/handymen${queryStr ? `?${queryStr}&page=${p}` : `?page=${p}`}`;

    return (
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Majstori</h1>
          <p className="mt-1 text-sm text-[#64748B]">Upravljanje majstorima platforme</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#64748B]">Status:</span>
          <Link
            href={`/admin/handymen${cityFilter ? `?city=${cityFilter}` : ""}${searchQ ? `${cityFilter ? "&" : "?"}search=${encodeURIComponent(searchQ)}` : ""}`}
          >
            <Badge variant={!statusFilter ? "default" : "outline"}>Svi</Badge>
          </Link>
          {(["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "BANNED"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/handymen?status=${s}${cityFilter ? `&city=${cityFilter}` : ""}${searchQ ? `&search=${encodeURIComponent(searchQ)}` : ""}`}
            >
              <Badge variant={statusFilter === s ? "default" : "outline"}>
                {s === "PENDING_REVIEW"
                  ? "Na čekanju"
                  : s === "ACTIVE"
                    ? "Aktivan"
                    : s === "SUSPENDED"
                      ? "Suspendovan"
                      : "Banned"}
              </Badge>
            </Link>
          ))}
        </div>

        <Card className="overflow-hidden rounded-2xl border-slate-200/90">
          <CardHeader>
            <CardTitle>Lista majstora ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:hidden">
              {withProfile.map((h) => {
                const hp = h.handymanProfile!;
                const isSuspended = !!h.suspendedAt;
                const isBanned = !!h.bannedAt;
                return (
                  <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{h.name}</p>
                        <p className="truncate text-xs text-slate-500">{h.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{h.phone ?? "-"} · {h.city ?? hp.cities[0] ?? "-"}</p>
                      </div>
                      {hp.workerStatus === "BANNED" || isBanned ? (
                        <Badge variant="destructive">Banovan</Badge>
                      ) : hp.workerStatus === "SUSPENDED" || isSuspended ? (
                        <Badge variant="secondary">Suspendovan</Badge>
                      ) : hp.workerStatus === "PENDING_REVIEW" ? (
                        <Badge variant="outline">Na čekanju</Badge>
                      ) : (
                        <Badge variant="success">Aktivan</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span>Verif: {hp.verifiedStatus}</span>
                      <span>Kategorije: {hp.workerCategories.length}</span>
                      <span>Krediti: {hp.creditsBalance}</span>
                      <span>Ponude: {h._count.offers}</span>
                    </div>
                    {hp.workerStatus === "PENDING_REVIEW" && (
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Čeka admin pregled profila pre javne objave.
                      </p>
                    )}
                    <div className="mt-3">
                      <Link href={`/admin/handymen/${h.id}`} className="text-sm font-medium text-[#2563EB] hover:underline">
                        Detalji
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4">Ime</th>
                    <th className="pb-3 pr-4">Telefon</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Grad</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Verifikacija</th>
                    <th className="pb-3 pr-4">Kategorije</th>
                    <th className="pb-3 pr-4">Krediti</th>
                    <th className="pb-3 pr-4">Ponude</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {withProfile.map((h) => {
                    const hp = h.handymanProfile!;
                    const isSuspended = !!h.suspendedAt;
                    const isBanned = !!h.bannedAt;
                    return (
                      <tr key={h.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{h.name}</td>
                        <td className="py-3 pr-4">{h.phone ?? "-"}</td>
                        <td className="py-3 pr-4">{h.email}</td>
                        <td className="py-3 pr-4">{h.city ?? hp.cities[0] ?? "-"}</td>
                        <td className="py-3 pr-4">
                          {hp.workerStatus === "BANNED" || isBanned ? (
                            <Badge variant="destructive">Banovan</Badge>
                          ) : hp.workerStatus === "SUSPENDED" || isSuspended ? (
                            <Badge variant="secondary">Suspendovan</Badge>
                          ) : hp.workerStatus === "PENDING_REVIEW" ? (
                            <Badge variant="outline">Čeka pregled</Badge>
                          ) : (
                            <Badge variant="success">Aktivan</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              hp.verifiedStatus === "VERIFIED"
                                ? "success"
                                : hp.verifiedStatus === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {hp.verifiedStatus}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{hp.workerCategories.length}</td>
                        <td className="py-3 pr-4">{hp.creditsBalance}</td>
                        <td className="py-3 pr-4">{h._count.offers}</td>
                        <td className="py-3">
                          <Link href={`/admin/handymen/${h.id}`} className="text-[#2563EB] hover:underline">
                            Detalji
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {withProfile.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema majstora</p>}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={pageLink(page - 1)} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
                    ← Prethodna
                  </Link>
                )}
                <span className="text-sm text-[#64748B]">
                  Strana {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={pageLink(page + 1)} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
                    Sljedeća →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const code = prismaErrorCode(err);
    console.error("[AdminHandymenSSR] fatal", {
      snapshot,
      message: e.message,
      name: e.name,
      stack: e.stack,
      prismaCode: code,
    });
    return (
      <AdminRouteLoadError
        routeTitle="Majstori"
        cardTitle="Ne možemo učitati listu majstora"
        logPrefix="[AdminHandymenSSR]"
        message={e.message}
        code={code}
        snapshot={snapshot as unknown as Record<string, unknown>}
        resetHref="/admin/handymen"
      />
    );
  }
}
