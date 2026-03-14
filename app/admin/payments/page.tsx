import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdminPermission("payments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Plaćanja</h1>
        <p className="mt-1 text-sm text-[#64748B]">Pregled uplata i transakcija</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uplate</CardTitle>
          <p className="text-sm text-[#64748B]">Modul plaćanja – spremno za integraciju payment gatewaya</p>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-[#64748B]">
            Nema uplata. Integriraj Stripe ili drugi payment provider za praćenje transakcija.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
