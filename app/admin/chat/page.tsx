import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  await requireAdminPermission("chat");
  const { prisma } = await import("@/lib/db");

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      request: { select: { id: true, category: true, city: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Chat</h1>
        <p className="mt-1 text-sm text-[#64748B]">Pregled razgovora korisnik–majstor</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Razgovori ({conversations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Zahtjev</th>
                  <th className="pb-3 pr-4">Broj poruka</th>
                  <th className="pb-3 pr-4">Zadnja poruka</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      {c.request.category} – {c.request.city}
                    </td>
                    <td className="py-3 pr-4">{c._count.messages}</td>
                    <td className="max-w-[200px] truncate py-3 pr-4">
                      {c.messages[0]?.content?.slice(0, 50) ?? "-"}
                    </td>
                    <td className="py-3">
                      <Link href={`/admin/chat/${c.id}`} className="text-[#2563EB] hover:underline">
                        Otvori
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {conversations.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema razgovora</p>}
        </CardContent>
      </Card>
    </div>
  );
}
