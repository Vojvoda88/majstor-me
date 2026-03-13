import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfferCard } from "@/components/lists/offer-card";
import { RequestDetailClient } from "./request-detail-client";
import { SendOfferForm } from "@/components/forms/send-offer-form";

const URGENCY_LABELS: Record<string, string> = {
  HITNO_DANAS: "Hitno danas",
  U_NAREDNA_2_DANA: "U naredna 2 dana",
  NIJE_HITNO: "Nije hitno",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const { prisma } = await import("@/lib/db");
  const req = await prisma.request.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, city: true } },
      offers: {
        include: {
          handyman: {
            select: {
              id: true,
              name: true,
              city: true,
              handymanProfile: {
                select: {
                  bio: true,
                  categories: true,
                  ratingAvg: true,
                  reviewCount: true,
                  verifiedStatus: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      review: true,
    },
  });

  if (!req) notFound();

  const isOwner = session?.user?.id === req.userId;
  const acceptedOffer = req.offers.find((o) => o.status === "ACCEPTED");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link href="/" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">← Nazad</Link>
        </div>
      </header>
      <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card className="border-[#E2E8F0] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{req.category}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{STATUS_LABELS[req.status]}</Badge>
                <Badge variant="outline">{URGENCY_LABELS[req.urgency]}</Badge>
                <Badge variant="outline">{req.city}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{req.description}</p>
          {req.address && (
            <p className="text-sm">
              <span className="font-medium">Adresa:</span> {req.address}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Objavio: {req.user.name} • {new Date(req.createdAt).toLocaleDateString("sr")}
          </p>
        </CardContent>
      </Card>

      {isOwner && req.status === "IN_PROGRESS" && acceptedOffer && (
        <Card className="mt-6 border-[#E2E8F0]">
          <CardHeader>
            <CardTitle>Prihvaćena ponuda</CardTitle>
            <CardDescription>Posao je u toku. Kada majstor završi, označite ga kao završen.</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestDetailClient
              requestId={req.id}
              acceptedOffer={acceptedOffer}
              sessionUserId={session!.user!.id}
            />
          </CardContent>
        </Card>
      )}

      {isOwner && req.status === "COMPLETED" && !req.review && acceptedOffer && (
        <Card className="mt-6 border-[#E2E8F0]">
          <CardHeader>
            <CardTitle>Ostavite recenziju</CardTitle>
            <CardDescription>Ocijenite majstora {acceptedOffer.handyman.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestDetailClient
              requestId={req.id}
              acceptedOffer={acceptedOffer}
              sessionUserId={session!.user!.id}
              showReviewForm
            />
          </CardContent>
        </Card>
      )}

      {req.review && (
        <Card className="mt-6 border-[#E2E8F0]">
          <CardHeader>
            <CardTitle>Vaša recenzija</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{req.review.rating}/5</span>
              {req.review.comment && <p>{req.review.comment}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers - for owner: see all; for handyman: see own; for others: nothing */}
      {session?.user?.role === "HANDYMAN" && req.status === "OPEN" && (
        <div className="mt-6">
          <SendOfferForm requestId={req.id} />
        </div>
      )}

      {(isOwner || session?.user?.role === "HANDYMAN") && req.offers.length > 0 && (
        <Card className="mt-6 border-[#E2E8F0]">
          <CardHeader>
            <CardTitle>Ponude ({req.offers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {req.offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isOwner={isOwner}
                  requestStatus={req.status}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!session && (
        <div className="mt-6 text-center">
          <Link href={`/login?callbackUrl=/request/${id}`}>
            <Button>Prijavite se da vidite ponude</Button>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}

