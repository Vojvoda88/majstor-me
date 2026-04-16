import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPermission("users");
  const { prisma } = await import("@/lib/db");
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  let users;
  let total: number;
  try {
    [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          role: true,
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
    ]);
  } catch (e) {
    console.error("[AdminUsers] error", e);
    throw e;
  }
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Korisnici</h1>
        <p className="mt-1 text-sm text-[#64748B]">Korisnici koji šalju zahtjeve</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista korisnika ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Ime</th>
                  <th className="pb-3 pr-4">Telefon</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Zahtjevi</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Registracija</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuspended = !!u.suspendedAt;
                  const isBanned = !!u.bannedAt;
                  return (
                    <tr key={u.id} className="border-b last:border-0">
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
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={`/admin/users?page=${page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
                  ← Prethodna
                </Link>
              )}
              <span className="text-sm text-[#64748B]">
                Strana {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/admin/users?page=${page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
                  Sljedeća →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
