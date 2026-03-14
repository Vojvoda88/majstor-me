import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdminPermission("content");
  const { prisma } = await import("@/lib/db");

  const faqItems = await prisma.faqItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Sadržaj / FAQ</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje FAQ i statičnim sadržajem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ stavke ({faqItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {faqItems.map((f) => (
              <li key={f.id} className="border-b pb-4 last:border-0">
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-sm text-[#64748B]">{f.answer.slice(0, 100)}...</p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Sort: {f.sortOrder} | {f.active ? "Aktivno" : "Neaktivno"}
                </p>
              </li>
            ))}
            {faqItems.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema FAQ stavki</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
