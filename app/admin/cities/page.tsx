import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitiesManager } from "./cities-manager";

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  const { adminRole } = await requireAdminPermission("cities");
  const { prisma } = await import("@/lib/db");

  const cities = await prisma.city.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const canEdit = adminRole === "SUPER_ADMIN" || adminRole === "OPERATIONS_ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Gradovi</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje gradovima u bazi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista gradova ({cities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CitiesManager
            canEdit={canEdit}
            cities={cities.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              active: c.active,
              sortOrder: c.sortOrder,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
