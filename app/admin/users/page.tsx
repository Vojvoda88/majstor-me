import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminVerifyEmailButton } from "@/components/admin/verify-email-button";
import { AdminStaffManager } from "./admin-staff-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { adminRole, session } = await requireAdminPermission("users");
  const { prisma } = await import("@/lib/db");
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  let users;
  let total: number;
  let adminUsers: {
    id: string;
    email: string;
    name: string;
    adminRole: "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "MODERATION_ADMIN" | "FINANCE_ADMIN" | "SUPPORT_ADMIN" | "READ_ONLY";
    createdAt: string;
  }[] = [];
  try {
    const [usersResult, totalResult, adminsResult] = await Promise.all([
      prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          role: true,
          emailVerified: true,
          suspendedAt: true,
          bannedAt: true,
          createdAt: true,
          _count: { select: { requests: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where: { role: "USER" } }),
      adminRole === "SUPER_ADMIN"
        ? prisma.user.findMany({
            where: { role: "ADMIN" },
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              adminProfile: { select: { adminRole: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);
    users = usersResult;
    total = totalResult;
    adminUsers = adminsResult.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      adminRole: (a.adminProfile?.adminRole ?? "READ_ONLY") as
        | "SUPER_ADMIN"
        | "OPERATIONS_ADMIN"
        | "MODERATION_ADMIN"
        | "FINANCE_ADMIN"
        | "SUPPORT_ADMIN"
        | "READ_ONLY",
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error("[AdminUsers] error", e);
    throw e;
  }
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Korisnici"
        description="Korisnici koji šalju zahtjeve"
        meta={`Ukupno: ${total}`}
      />

      {adminRole === "SUPER_ADMIN" && (
        <Card className="rounded-2xl border-slate-200/90 shadow-sm">
          <CardHeader>
            <CardTitle>Admin nalozi i pod-admin pristup</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminStaffManager admins={adminUsers} currentUserId={session.user.id} />
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle>Lista korisnika ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Ime</th>
                  <th className="pb-3 pr-4">Telefon</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Zahtjevi</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Registracija</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuspended = !!u.suspendedAt;
                  const isBanned = !!u.bannedAt;
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/70">
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4">{u.phone ?? "-"}</td>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.city ?? "-"}</td>
                      <td className="py-3 pr-4">{u._count.requests}</td>
                      <td className="py-3 pr-4">
                        {isBanned ? (
                          <Badge variant="destructive">Banovan</Badge>
                        ) : isSuspended ? (
                          <Badge variant="secondary">Suspendovan</Badge>
                        ) : (
                          <Badge variant="success">Aktivan</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {u.emailVerified ? (
                          <Badge variant="success">Verifikovan</Badge>
                        ) : (
                          <AdminVerifyEmailButton userId={u.id} />
                        )}
                      </td>
                      <td className="py-3 pr-4 text-[#64748B]">{new Date(u.createdAt).toLocaleDateString("sr")}</td>
                      <td className="py-3">
                        <Link href={`/admin/users/${u.id}`} className="text-[#2563EB] hover:underline">
                          Detalji
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema korisnika</p>}
          <AdminListPagination
            page={page}
            totalPages={totalPages}
            prevHref={page > 1 ? `/admin/users?page=${page - 1}` : undefined}
            nextHref={page < totalPages ? `/admin/users?page=${page + 1}` : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
