import { requireAdminPermission } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RequestDetailActions } from "./request-detail-actions";
import { RestoreRequestButton } from "./restore-button";
import { MarkAsBypassAttemptButton } from "@/components/admin/mark-as-bypass-button";

export const dynamic = "force-dynamic";

const ADMIN_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Na čekanju",
  DISTRIBUTED: "Distribuiran",
  HAS_OFFERS: "Ima ponude",
  CONTACT_UNLOCKED: "Kontakt otključan",
  CLOSED: "Zatvoren",
  SPAM: "Spam",
  DELETED: "Obrisan",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("requests");
  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  const req = await prisma.request.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      offers: {
        include: { handyman: { select: { id: true, name: true } } },
      },
      contactUnlocks: {
        include: { handyman: { select: { id: true, name: true } } },
      },
    },
  });

  if (!req) notFound();

  const requesterName = req.requesterName ?? req.user?.name ?? "Guest";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{req.title ?? req.category}</h1>
        <p className="mt-1 text-sm text-[#64748B]">{req.category} – {req.city}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Korisnik (admin vidi sve)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Ime:</strong> {requesterName}</p>
            <p><strong>Telefon:</strong> {req.requesterPhone ?? req.user?.phone ?? "-"}</p>
            <p><strong>Email:</strong> {req.requesterEmail ?? req.user?.email ?? "-"}</p>
            <p><strong>Grad:</strong> {req.city}</p>
            <p><strong>Adresa:</strong> {req.address ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zahtjev</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Admin status:</strong> <Badge variant="outline">{ADMIN_STATUS_LABELS[req.adminStatus ?? ""] ?? req.adminStatus ?? "–"}</Badge></p>
            <p><strong>Status:</strong> <Badge>{STATUS_LABELS[req.status] ?? req.status}</Badge></p>
            <p><strong>Datum:</strong> {new Date(req.createdAt).toLocaleString("sr")}</p>
            <p><strong>Broj ponuda:</strong> {req.offers.length}</p>
            <p><strong>Broj otključanja:</strong> {req.contactUnlocks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{req.description}</p>
        </CardContent>
      </Card>

      {req.adminStatus !== "SPAM" && req.adminStatus !== "DELETED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anti-bypass</CardTitle>
            <p className="text-sm text-[#64748B]">
              Ako zahtjev sadrži kontakt u slikama ili opisu (zaobilazi unlock), označite ga.
            </p>
          </CardHeader>
          <CardContent>
            <MarkAsBypassAttemptButton requestId={req.id} canMark={true} />
          </CardContent>
        </Card>
      )}

      {req.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slike</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {req.photos.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="block relative h-24 w-24">
                  <Image src={url} alt="" width={96} height={96} className="rounded object-cover" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ponude ({req.offers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {req.offers.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/handymen/${o.handymanId}`} className="hover:underline">
                  {o.handyman.name}
                </Link>
                <span className="ml-2 text-[#64748B]">{o.status}</span>
              </li>
            ))}
          </ul>
          {req.offers.length === 0 && <p className="text-[#64748B]">Nema ponuda</p>}
        </CardContent>
      </Card>

      {req.adminStatus === "DELETED" && (
        <RestoreRequestButton requestId={req.id} />
      )}

      {req.adminStatus === "PENDING_REVIEW" && (
        <RequestDetailActions
          requestId={req.id}
          requesterPhone={req.requesterPhone}
          adminStatus={req.adminStatus}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ko je otključao kontakt</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {req.contactUnlocks.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/handymen/${u.handymanId}`} className="hover:underline">
                  {u.handyman.name}
                </Link>
              </li>
            ))}
          </ul>
          {req.contactUnlocks.length === 0 && <p className="text-[#64748B]">Niko</p>}
        </CardContent>
      </Card>
    </div>
  );
}
