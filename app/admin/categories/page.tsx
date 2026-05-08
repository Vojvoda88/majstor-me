import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getOfficialCategoryCoverage } from "@/lib/admin/category-coverage";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminPermission("categories");
  const { prisma } = await import("@/lib/db");

  const [categories, officialCoverage] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { workerCategories: true } },
      },
    }),
    getOfficialCategoryCoverage(prisma),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Kategorije</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje kategorijama usluga</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Službene kategorije (realno stanje)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[#64748B]">
            Ovaj pregled sabira i legacy nazive u službene kategorije. Kolona <strong>Javno</strong> koristi ista pravila kao listing na sajtu.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Kategorija</th>
                  <th className="pb-3 pr-4">Registrovani</th>
                  <th className="pb-3 pr-4">Aktivni</th>
                  <th className="pb-3 pr-4">Javno</th>
                </tr>
              </thead>
              <tbody>
                {officialCoverage.map((row) => (
                  <tr key={row.category} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.category}</td>
                    <td className="py-3 pr-4">{row.registered}</td>
                    <td className="py-3 pr-4">{row.active}</td>
                    <td className="py-3 pr-4">{row.publicVisible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw tabela kategorija u bazi ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[#64748B]">
            Ovdje su svi istorijski redovi iz baze (uključujući legacy varijante naziva).
          </p>
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
