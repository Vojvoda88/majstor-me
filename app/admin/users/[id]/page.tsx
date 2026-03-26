import { requireAdminPermission } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("users");
  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id, role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        suspendedAt: true,
        bannedAt: true,
        requests: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            category: true,
            city: true,
            createdAt: true,
          },
        },
      },
    });
  } catch (e) {
    console.error("[AdminUsers] error", e);
    throw e;
  }

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{user.name}</h1>
        <p className="mt-1 text-sm text-[#64748B]">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Telefon:</strong> {user.phone ?? "-"}</p>
          <p><strong>Grad:</strong> {user.city ?? "-"}</p>
          <p><strong>Status:</strong> {user.bannedAt ? "Banned" : user.suspendedAt ? "Suspendovan" : "Aktivan"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zahtjevi ({user.requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {user.requests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/requests/${r.id}`} className="hover:underline">
                  {r.category} – {r.city}
                </Link>
                <span className="ml-2 text-[#64748B]">{new Date(r.createdAt).toLocaleDateString("sr")}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
