import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings");
  const { prisma } = await import("@/lib/db");

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Podešavanja</h1>
        <p className="mt-1 text-sm text-[#64748B]">Sistemske postavke platforme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trenutna podešavanja</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-[#64748B]">CREDITS_PER_CONTACT_UNLOCK</dt>
              <dd className="mt-1">{settingsMap["CREDITS_PER_CONTACT_UNLOCK"] ?? "1 (default)"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#64748B]">CREDITS_REQUIRED</dt>
              <dd className="mt-1">{settingsMap["CREDITS_REQUIRED"] ?? "env varijabla"}</dd>
            </div>
            {settings.map((s) => (
              <div key={s.id}>
                <dt className="text-sm font-medium text-[#64748B]">{s.key}</dt>
                <dd className="mt-1">{s.value}</dd>
              </div>
            ))}
          </dl>
          {settings.length === 0 && (
            <p className="py-4 text-sm text-[#64748B]">
              Nema custom podešavanja. Dodaj API za uređivanje system_settings tabele.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
