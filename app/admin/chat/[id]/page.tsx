import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminChatDetailsPage({ params }: Props) {
  await requireAdminPermission("chat");
  const { prisma } = await import("@/lib/db");
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      request: {
        select: {
          id: true,
          category: true,
          city: true,
          user: { select: { id: true, name: true, email: true } },
          offers: {
            where: { status: "ACCEPTED" },
            include: { handyman: { select: { id: true, name: true, email: true } } },
            take: 1,
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const acceptedOffer = conversation.request.offers[0] ?? null;
  const handyman = acceptedOffer?.handyman ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Detalji razgovora</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {conversation.request.category} - {conversation.request.city}
          </p>
        </div>
        <Link href="/admin/chat" className="text-sm font-medium text-[#2563EB] hover:underline">
          Nazad na listu
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Učesnici</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Korisnik:</span>{" "}
            {conversation.request.user?.name ?? "Nepoznat korisnik"}
            {conversation.request.user?.email ? ` (${conversation.request.user.email})` : ""}
          </p>
          <p>
            <span className="font-medium">Majstor:</span>{" "}
            {handyman?.name ?? "Nije odabran"}
            {handyman?.email ? ` (${handyman.email})` : ""}
          </p>
          <p>
            <span className="font-medium">Zahtjev:</span>{" "}
            <Link href={`/request/${conversation.request.id}`} className="text-[#2563EB] hover:underline">
              Otvori zahtjev
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poruke ({conversation.messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-[#64748B]">Još nema poruka.</p>
          ) : (
            <div className="space-y-3">
              {conversation.messages.map((message) => (
                <div key={message.id} className="rounded-lg border border-[#E2E8F0] p-3">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs text-[#64748B]">
                    <span>{message.sender.name ?? message.sender.email ?? "Nepoznat pošiljalac"}</span>
                    <span>{new Date(message.createdAt).toLocaleString("sr-Latn-ME")}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-[#0F172A]">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
