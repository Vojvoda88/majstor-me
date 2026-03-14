import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminPermission("categories");
  const { prisma } = await import("@/lib/db");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { workerCategories: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Kategorije</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje kategorijama usluga</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista kategorija ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Naziv</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Majstora</th>
                  <th className="pb-3 pr-4">Aktivna</th>
                  <th className="pb-3 pr-4">Sort</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-[#64748B]">{c.slug ?? "-"}</td>
                    <td className="py-3 pr-4">{c._count.workerCategories}</td>
                    <td className="py-3 pr-4">{c.active ? "Da" : "Ne"}</td>
                    <td className="py-3 pr-4">{c.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {categories.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema kategorija</p>}
        </CardContent>
      </Card>
    </div>
  );
}
