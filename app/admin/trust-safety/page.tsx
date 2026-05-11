import { requireAdminPermission } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPhoneForm } from "./add-phone-form";

export const dynamic = "force-dynamic";

export default async function TrustSafetyPage() {
  const { adminRole } = await requireAdminPermission("trust_safety");
  const canWrite = hasPermission(adminRole, "trust_safety_write");
  const { prisma } = await import("@/lib/db");

  const [blacklistedPhones, blacklistedEmails] = await Promise.all([
    prisma.blacklistedPhone.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.blacklistedEmail.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Sigurnost i povjerenje</h1>
        <p className="mt-1 text-sm text-[#64748B]">Blokirani kontakti i sigurnosni pregled</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Blokirani telefoni ({blacklistedPhones.length})</CardTitle>
            <AddPhoneForm canWrite={canWrite} />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {blacklistedPhones.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.phone}</span>
                  <span className="text-[#64748B]">{b.reason ?? "-"}</span>
                </li>
              ))}
              {blacklistedPhones.length === 0 && <p className="text-[#64748B]">Nema</p>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blokirani email nalozi ({blacklistedEmails.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {blacklistedEmails.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.email}</span>
                  <span className="text-[#64748B]">{b.reason ?? "-"}</span>
                </li>
              ))}
              {blacklistedEmails.length === 0 && <p className="text-[#64748B]">Nema</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
