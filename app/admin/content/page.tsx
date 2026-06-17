import { requireAdminPermission } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqManager } from "./faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const { adminRole } = await requireAdminPermission("content");
  const { prisma } = await import("@/lib/db");

  const faqItems = await prisma.faqItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const canEdit = hasPermission(adminRole, "content_write");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Sadržaj / FAQ</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Upravljanje FAQ na početnoj stranici. Aktivne stavke se prikazuju javno; ako nema stavki u bazi, sajt koristi
          ugrađeni fallback.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ stavke ({faqItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqManager
            canEdit={canEdit}
            items={faqItems.map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              sortOrder: f.sortOrder,
              active: f.active,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
