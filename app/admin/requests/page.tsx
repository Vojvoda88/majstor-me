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
import { DeleteButtonInline } from "./delete-button-inline";
import { ADMIN_REQUEST_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import type { Prisma } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";

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
const SORT_VALUES = ["createdAt_desc", "createdAt_asc"] as const;
type RequestSort = (typeof SORT_VALUES)[number];
const REQUEST_STATUS_VALUES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const REQUEST_ADMIN_STATUS_VALUES = [
  "PENDING_REVIEW",
  "DISTRIBUTED",
  "HAS_OFFERS",
  "CONTACT_UNLOCKED",
  "CLOSED",
  "SPAM",
  "DELETED",
] as const;
type RequestStatusValue = (typeof REQUEST_STATUS_VALUES)[number];
type RequestAdminStatusValue = (typeof REQUEST_ADMIN_STATUS_VALUES)[number];

type AdminRequestsSnapshot = {
  statusFilter?: string;
  adminStatusFilter?: string;
  cityFilter?: string;
  categoryFilter?: string;
  searchQ?: string;
  sort: RequestSort;
  page: number;
};

function buildRequestsQuery(params: {
  status?: string;
  adminStatus?: string;
  city?: string;
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
}) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.adminStatus) q.set("adminStatus", params.adminStatus);
  if (params.city) q.set("city", params.city);
  if (params.category) q.set("category", params.category);
  if (params.search) q.set("search", params.search);
  if (params.sort && params.sort !== "createdAt_desc") q.set("sort", params.sort);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  return q.toString();
}

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const { adminRole } = await requireAdminPermission("requests");
  const canWriteRequests = adminRole !== "READ_ONLY";

  let snapshot: AdminRequestsSnapshot = { page: 1, sort: "createdAt_desc" };

  try {
    const { prisma } = await import("@/lib/db");

    const raw = await resolveAdminSearchParams(searchParams);
    const statusFilter = firstQueryString(raw.status);
    const adminStatusFilter = firstQueryString(raw.adminStatus);
    const cityFilter = firstQueryString(raw.city);
    const categoryFilter = firstQueryString(raw.category);
    const searchQ = firstQueryString(raw.search)?.trim();
    const sortRaw = firstQueryString(raw.sort);
    const sort: RequestSort =
      sortRaw && (SORT_VALUES as readonly string[]).includes(sortRaw) ? (sortRaw as RequestSort) : "createdAt_desc";
    const { page, skip, take } = adminPaginationPage(firstQueryString(raw.page), PAGE_SIZE);

    snapshot = {
      statusFilter,
      adminStatusFilter,
      cityFilter,
      categoryFilter,
      searchQ: searchQ || undefined,
      sort,
      page,
    };

    if (process.env.ADMIN_REQUESTS_DEBUG === "1") {
      console.warn("[AdminRequestsSSR] start", snapshot);
    }

    const where: Prisma.RequestWhereInput = {};
    if (statusFilter && (REQUEST_STATUS_VALUES as readonly string[]).includes(statusFilter)) {
      where.status = statusFilter as RequestStatusValue;
    }
    if (
      adminStatusFilter &&
      (REQUEST_ADMIN_STATUS_VALUES as readonly string[]).includes(adminStatusFilter)
    ) {
      where.adminStatus = adminStatusFilter as RequestAdminStatusValue;
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

    const orderBy: Prisma.RequestOrderByWithRelationInput =
      sort === "createdAt_asc" ? { createdAt: "asc" } : { createdAt: "desc" };

    let requests;
    let total: number;

    try {
      [requests, total] = await Promise.all([
        prisma.request.findMany({
          where,
          select: ADMIN_REQUEST_LIST_SELECT,
          orderBy,
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
    const queryStr = buildRequestsQuery({
      status: statusFilter,
      adminStatus: adminStatusFilter,
      city: cityFilter,
      category: categoryFilter,
      search: searchQ,
      sort,
    });
    const pageLink = (p: number) => `/admin/requests${queryStr ? `?${queryStr}&page=${p}` : `?page=${p}`}`;

    return (
      <div className="space-y-5 sm:space-y-6">
        <AdminPageHeader
          title="Zahtjevi"
          description="Svi zahtjevi / leadovi"
          meta={`Ukupno: ${total}`}
        />

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
          <Link href={`/admin/requests${buildRequestsQuery({ adminStatus: adminStatusFilter, city: cityFilter, category: categoryFilter, search: searchQ, sort }) ? `?${buildRequestsQuery({ adminStatus: adminStatusFilter, city: cityFilter, category: categoryFilter, search: searchQ, sort })}` : ""}`}>
            <Badge variant={!statusFilter ? "default" : "outline"}>Svi</Badge>
          </Link>
          {(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/requests?${buildRequestsQuery({
                status: s,
                adminStatus: adminStatusFilter,
                city: cityFilter,
                category: categoryFilter,
                search: searchQ,
                sort,
              })}`}
            >
              <Badge variant={statusFilter === s ? "default" : "outline"}>{STATUS_LABELS[s]}</Badge>
            </Link>
          ))}
          <span className="ml-4 text-sm text-[#64748B]">Admin:</span>
          <Link
            href={`/admin/requests${buildRequestsQuery({
              status: statusFilter,
              city: cityFilter,
              category: categoryFilter,
              search: searchQ,
              sort,
            }) ? `?${buildRequestsQuery({
              status: statusFilter,
              city: cityFilter,
              category: categoryFilter,
              search: searchQ,
              sort,
            })}` : ""}`}
          >
            <Badge variant={!adminStatusFilter ? "default" : "outline"}>Svi</Badge>
          </Link>
          {(["PENDING_REVIEW", "DISTRIBUTED", "HAS_OFFERS", "CONTACT_UNLOCKED", "CLOSED", "SPAM", "DELETED"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/requests?${buildRequestsQuery({
                adminStatus: s,
                status: statusFilter,
                city: cityFilter,
                category: categoryFilter,
                search: searchQ,
                sort,
              })}`}
            >
              <Badge variant={adminStatusFilter === s ? "default" : "outline"}>{ADMIN_STATUS_LABELS[s]}</Badge>
            </Link>
          ))}
        </div>

        <Card className="overflow-hidden rounded-2xl border-slate-200/90">
          <CardHeader>
            <CardTitle>
              Lista zahtjeva ({total}) · Strana {page}/{totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:hidden">
              {requests.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {r.title ?? (r.description ?? "").slice(0, 60)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.requesterName ?? r.user?.name ?? "Guest"} · {r.city}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[11px]">
                      {ADMIN_STATUS_LABELS[r.adminStatus ?? ""] ?? r.adminStatus ?? "–"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <Badge
                      variant={r.status === "COMPLETED" ? "success" : r.status === "CANCELLED" ? "secondary" : "default"}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                    <span>{new Date(r.createdAt).toLocaleDateString("sr")}</span>
                    <span>Ponude: {r._count.offers}</span>
                    <span>Otključ.: {r._count.contactUnlocks}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Link href={`/admin/requests/${r.id}`} className="text-sm font-medium text-[#2563EB] hover:underline">
                      Detalji
                    </Link>
                    {r.adminStatus === "DELETED"
                      ? <RestoreButtonInline requestId={r.id} />
                      : canWriteRequests && <DeleteButtonInline requestId={r.id} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
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
                      <td className="py-3 pr-4">{r._count.offers}</td>
                      <td className="py-3 pr-4">{r._count.contactUnlocks}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/requests/${r.id}`} className="text-[#2563EB] hover:underline">
                            Detalji
                          </Link>
                          {r.adminStatus === "DELETED"
                            ? <RestoreButtonInline requestId={r.id} />
                            : canWriteRequests && <DeleteButtonInline requestId={r.id} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {requests.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema zahtjeva</p>}
            <AdminListPagination
              page={page}
              totalPages={totalPages}
              prevHref={page > 1 ? pageLink(page - 1) : undefined}
              nextHref={page < totalPages ? pageLink(page + 1) : undefined}
            />
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
