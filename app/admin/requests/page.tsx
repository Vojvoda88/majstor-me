import { Suspense } from "react";
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
import { RequestFilters } from "./request-filters";
import { RestoreButtonInline } from "./restore-button-inline";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

const ADMIN_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Na čekanju",
  DISTRIBUTED: "Distribuiran",
  HAS_OFFERS: "Ima ponude",
  CONTACT_UNLOCKED: "Kontakt otključan",
  CLOSED: "Zatvoren",
  SPAM: "Spam",
  DELETED: "Obrisan",
};

const PAGE_SIZE = 25;

/** Samo kolone potrebne za listu — izbjegava P2022 kad DB nema novije kolone koje puni Prisma model. */
const REQUEST_LIST_SELECT = {
  id: true,
  adminStatus: true,
  requesterName: true,
  city: true,
  category: true,
  title: true,
  description: true,
  createdAt: true,
  status: true,
  user: { select: { name: true } },
  offers: { select: { id: true } },
  contactUnlocks: { select: { id: true } },
} as const;

type AdminRequestsSnapshot = {
  statusFilter?: string;
  adminStatusFilter?: string;
  cityFilter?: string;
  categoryFilter?: string;
  searchQ?: string;
  page: number;
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  await requireAdminPermission("requests");

  let snapshot: AdminRequestsSnapshot = { page: 1 };

  try {
    const { prisma } = await import("@/lib/db");

    const raw = await resolveAdminSearchParams(searchParams);
    const statusFilter = firstQueryString(raw.status);
    const adminStatusFilter = firstQueryString(raw.adminStatus);
    const cityFilter = firstQueryString(raw.city);
    const categoryFilter = firstQueryString(raw.category);
    const searchQ = firstQueryString(raw.search)?.trim();
    const { page, skip, take } = adminPaginationPage(firstQueryString(raw.page), PAGE_SIZE);

    snapshot = {
      statusFilter,
      adminStatusFilter,
      cityFilter,
      categoryFilter,
      searchQ: searchQ || undefined,
      page,
    };

    if (process.env.ADMIN_REQUESTS_DEBUG === "1") {
      console.warn("[AdminRequestsSSR] start", snapshot);
    }

    const where: Record<string, unknown> = {};
    if (statusFilter && ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(statusFilter)) {
      where.status = statusFilter;
    }
    if (
      adminStatusFilter &&
      ["PENDING_REVIEW", "DISTRIBUTED", "HAS_OFFERS", "CONTACT_UNLOCKED", "CLOSED", "SPAM", "DELETED"].includes(
        adminStatusFilter
      )
    ) {
      where.adminStatus = adminStatusFilter;
    }
    if (cityFilter) where.city = cityFilter;
    if (categoryFilter) where.category = categoryFilter;
    if (searchQ) {
      where.OR = [
        { requesterName: { contains: searchQ, mode: "insensitive" } },
        { requesterPhone: { contains: searchQ, mode: "insensitive" } },
        { requesterEmail: { contains: searchQ, mode: "insensitive" } },
        { user: { name: { contains: searchQ, mode: "insensitive" } } },
      ];
    }

    if (adminStatusFilter !== "DELETED") {
      where.deletedAt = null;
    }

    let requests;
    let total: number;

    try {
      [requests, total] = await Promise.all([
        prisma.request.findMany({
          where,
          select: REQUEST_LIST_SELECT,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.request.count({ where }),
      ]);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[AdminRequestsSSR] prisma.request findMany/count failed", {
        snapshot,
        message: err.message,
        name: err.name,
      });
      throw err;
    }

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const baseQuery = new URLSearchParams();
    if (statusFilter) baseQuery.set("status", statusFilter);
    if (adminStatusFilter) baseQuery.set("adminStatus", adminStatusFilter);
    if (cityFilter) baseQuery.set("city", cityFilter);
    if (categoryFilter) baseQuery.set("category", categoryFilter);
    if (searchQ) baseQuery.set("search", searchQ);
    const queryStr = baseQuery.toString();
    const pageLink = (p: number) => `/admin/requests${queryStr ? `?${queryStr}&page=${p}` : `?page=${p}`}`;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Zahtjevi</h1>
          <p className="mt-1 text-sm text-[#64748B]">Svi zahtjevi / leadovi</p>
        </div>

        {/** useSearchParams u RequestFilters zahtijeva Suspense — inače RSC digest na mobilnom/admin. */}
        <Suspense
          fallback={
            <div
              className="h-[120px] animate-pulse rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
              aria-hidden
            />
          }
        >
          <RequestFilters />
        </Suspense>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-[#64748B]">Status:</span>
          <Link href="/admin/requests">
            <Badge variant={!statusFilter ? "default" : "outline"}>Svi</Badge>
          </Link>
          {(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/requests?status=${s}${adminStatusFilter ? `&adminStatus=${adminStatusFilter}` : ""}${cityFilter ? `&city=${cityFilter}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}${searchQ ? `&search=${encodeURIComponent(searchQ)}` : ""}`}
            >
              <Badge variant={statusFilter === s ? "default" : "outline"}>{STATUS_LABELS[s]}</Badge>
            </Link>
          ))}
          <span className="ml-4 text-sm text-[#64748B]">Admin:</span>
          <Link
            href={(() => {
              const p = new URLSearchParams();
              if (statusFilter) p.set("status", statusFilter);
              if (cityFilter) p.set("city", cityFilter);
              if (categoryFilter) p.set("category", categoryFilter);
              if (searchQ) p.set("search", searchQ);
              return `/admin/requests${p.toString() ? `?${p.toString()}` : ""}`;
            })()}
          >
            <Badge variant={!adminStatusFilter ? "default" : "outline"}>Svi</Badge>
          </Link>
          {(["PENDING_REVIEW", "DISTRIBUTED", "SPAM", "DELETED"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/requests?adminStatus=${s}${statusFilter ? `&status=${statusFilter}` : ""}${cityFilter ? `&city=${cityFilter}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}${searchQ ? `&search=${encodeURIComponent(searchQ)}` : ""}`}
            >
              <Badge variant={adminStatusFilter === s ? "default" : "outline"}>{ADMIN_STATUS_LABELS[s]}</Badge>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista zahtjeva ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Admin</th>
                    <th className="pb-3 pr-4">Korisnik</th>
                    <th className="pb-3 pr-4">Grad</th>
                    <th className="pb-3 pr-4">Kategorija</th>
                    <th className="pb-3 pr-4">Naslov</th>
                    <th className="pb-3 pr-4">Datum</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Ponude</th>
                    <th className="pb-3 pr-4">Otključanja</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{r.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">
                          {ADMIN_STATUS_LABELS[r.adminStatus ?? ""] ?? r.adminStatus ?? "–"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{r.requesterName ?? r.user?.name ?? "Guest"}</td>
                      <td className="py-3 pr-4">{r.city}</td>
                      <td className="py-3 pr-4">{r.category}</td>
                      <td className="max-w-[150px] truncate py-3 pr-4">
                        {r.title ?? (r.description ?? "").slice(0, 30)}
                      </td>
                      <td className="py-3 pr-4 text-[#64748B]">{new Date(r.createdAt).toLocaleDateString("sr")}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            r.status === "COMPLETED" ? "success" : r.status === "CANCELLED" ? "secondary" : "default"
                          }
                        >
                          {STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{r.offers.length}</td>
                      <td className="py-3 pr-4">{r.contactUnlocks.length}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/requests/${r.id}`} className="text-[#2563EB] hover:underline">
                            Detalji
                          </Link>
                          {r.adminStatus === "DELETED" && <RestoreButtonInline requestId={r.id} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {requests.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema zahtjeva</p>}
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
    const prismaCode = prismaErrorCode(err);
    console.error("[AdminRequestsSSR] fatal", {
      snapshot,
      message: e.message,
      name: e.name,
      stack: e.stack,
      prismaCode,
    });
    return (
      <AdminRouteLoadError
        routeTitle="Zahtjevi"
        cardTitle="Ne možemo učitati listu zahtjeva"
        logPrefix="[AdminRequestsSSR]"
        message={e.message}
        code={prismaCode}
        snapshot={snapshot as unknown as Record<string, unknown>}
        resetHref="/admin/requests"
      />
    );
  }
}
