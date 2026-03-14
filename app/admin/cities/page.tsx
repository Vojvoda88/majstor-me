import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  await requireAdminPermission("cities");
  const { prisma } = await import("@/lib/db");

  const cities = await prisma.city.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Gradovi</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje gradovima</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista gradova ({cities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Naziv</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Aktivan</th>
                  <th className="pb-3 pr-4">Sort</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-[#64748B]">{c.slug ?? "-"}</td>
                    <td className="py-3 pr-4">{c.active ? "Da" : "Ne"}</td>
                    <td className="py-3 pr-4">{c.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cities.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">
              Nema gradova u bazi. Gradovi se trenutno koriste iz constants.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
