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
import { CancelRequestButton } from "@/components/request/cancel-request-button";
import { RequestSuccessBanner } from "@/components/request/request-success-banner";
import { RequestChatPanel } from "@/components/chat/request-chat-panel";
import { InviteHandymanForm } from "@/components/invite/invite-handyman-form";
import { UnlockContactButton } from "@/components/request/unlock-contact-button";
import { SiteHeader } from "@/components/layout/site-header";
import { MapPin, Calendar, User } from "lucide-react";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const session = await auth();

  const { prisma } = await import("@/lib/db");
  const req = await prisma.request.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, city: true } },
      contactUnlocks: { select: { handymanId: true } },
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
                  ratingAvg: true,
                  reviewCount: true,
                  verifiedStatus: true,
                  workerCategories: { include: { category: true } },
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

  let handymenNotified = 0;
  try {
    handymenNotified = await prisma.handymanProfile.count({
      where: {
        workerCategories: {
          some: { category: { name: req.category } },
        },
      },
    });
  } catch {
    // ignore
  }

  const isOwner =
    (req.userId && session?.user?.id === req.userId) ||
    (!req.userId && !!req.requesterToken && token === req.requesterToken);
  const requesterName = req.user?.name ?? req.requesterName ?? "Korisnik";
  const handymanUnlocked = session?.user?.role === "HANDYMAN" && req.contactUnlocks.some((u) => u.handymanId === session.user.id);
  const acceptedOffer = req.offers.find((o) => o.status === "ACCEPTED");

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={session?.user?.role === "USER" ? "/dashboard/user" : session?.user?.role === "HANDYMAN" ? "/dashboard/handyman" : "/"}
          className="mb-6 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          ← Nazad
        </Link>

      {isOwner && (
        <RequestSuccessBanner requestId={id} handymenNotified={handymenNotified} />
      )}

      <Card className="rounded-xl bg-white shadow-sm transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#0F172A] sm:text-2xl">
            {req.title ?? req.category}
          </CardTitle>
          <p className="text-sm text-[#64748B]">{req.category}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                req.status === "COMPLETED"
                  ? "success"
                  : req.status === "CANCELLED"
                    ? "secondary"
                    : "default"
              }
              className={req.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 border-blue-200" : undefined}
            >
              {STATUS_LABELS[req.status]}
            </Badge>
            <Badge
              variant={
                req.urgency === "HITNO_DANAS"
                  ? "destructive"
                  : req.urgency === "U_NAREDNA_2_DANA"
                    ? "warning"
                    : "outline"
              }
            >
              {URGENCY_LABELS[req.urgency]}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-[#64748B]">
              <MapPin className="h-4 w-4" />
              {req.city}
            </span>
            <span className="flex items-center gap-1 text-sm text-[#64748B]">
              <Calendar className="h-4 w-4" />
              {new Date(req.createdAt).toLocaleDateString("sr")}
            </span>
            <span className="flex items-center gap-1 text-sm text-[#64748B]">
              <User className="h-4 w-4" />
              {requesterName}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwner && req.status === "OPEN" && handymenNotified > 0 && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Obavijestili smo {handymenNotified} majstora u vašoj oblasti koji mogu poslati ponude.
            </p>
          )}
          <div>
            <h3 className="text-sm font-medium text-[#475569]">Opis</h3>
            <p className="mt-1 text-[#64748B]">{req.description}</p>
          </div>
          {req.photos && req.photos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#475569]">Slike</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {req.photos.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                    <img src={url} alt="" className="h-24 w-24 rounded-lg object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {(isOwner || handymanUnlocked) && req.address && (
            <div>
              <h3 className="text-sm font-medium text-[#475569]">Adresa</h3>
              <p className="mt-1 text-[#64748B]">{req.address}</p>
            </div>
          )}
          {session?.user?.role === "HANDYMAN" && !isOwner && (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <h3 className="text-sm font-medium text-[#475569]">Kontakt korisnika</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Otključajte kontakt da biste vidjeli broj telefona i adresu. Troši 1 kredit.
              </p>
              <UnlockContactButton
              requestId={req.id}
              alreadyUnlocked={handymanUnlocked}
            />
            </div>
          )}
          {isOwner && session && (req.status === "OPEN" || req.status === "IN_PROGRESS") && (
            <div className="pt-2 border-t border-[#E2E8F0]">
              <CancelRequestButton requestId={req.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner && req.status === "IN_PROGRESS" && acceptedOffer && (
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle>Prihvaćena ponuda</CardTitle>
            <CardDescription>
              {session ? "Posao je u toku. Kada majstor završi, označite ga kao završen." : "Vaš izbor je primljen. Majstor će vas kontaktirati."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session?.user?.id && (
              <>
                <RequestDetailClient
                  requestId={req.id}
                  acceptedOffer={acceptedOffer}
                  sessionUserId={session.user.id}
                />
                <RequestChatPanel requestId={req.id} />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {session?.user?.role === "HANDYMAN" && req.status === "IN_PROGRESS" && acceptedOffer?.handymanId === session.user.id && (
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle>Razgovor sa korisnikom</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestChatPanel requestId={req.id} />
          </CardContent>
        </Card>
      )}

      {isOwner && session?.user?.id && req.status === "COMPLETED" && !req.review && acceptedOffer && (
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
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
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
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

      {isOwner && session?.user?.role === "USER" && req.status === "OPEN" && (
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
          <CardContent className="pt-6">
            <InviteHandymanForm requestId={req.id} />
          </CardContent>
        </Card>
      )}

      {session?.user?.role === "HANDYMAN" && req.status === "OPEN" && (
        <div className="mt-6">
          <SendOfferForm requestId={req.id} />
        </div>
      )}

      {(isOwner || session?.user?.role === "HANDYMAN") && req.offers.length > 0 && (
        <Card className="mt-6 rounded-xl bg-white shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Ponude ({req.offers.length})</CardTitle>
            <CardDescription>Uporedite ponude i izaberite najboljeg majstora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {req.offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isOwner={isOwner}
                  requestStatus={req.status}
                  requesterToken={isOwner && !req.userId ? req.requesterToken : undefined}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!session && !isOwner && (
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

