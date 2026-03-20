import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import {
  getCreditsRequiredForLead,
  isCreditsRequired,
  hasEnoughCreditsForUnlock,
} from "@/lib/credits";
import { getCreditsBreakdown } from "@/lib/lead-tier";
import { trackFunnelEvent } from "@/lib/funnel-events";

export const dynamic = "force-dynamic";

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "-";
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
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
import { LeadPriceBreakdown } from "@/components/request/lead-price-breakdown";
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
      user: { select: { id: true, name: true, city: true, emailVerified: true, phoneVerified: true } },
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
  const fullRequesterName = req.user?.name ?? req.requesterName ?? "Korisnik";
  const handymanUnlocked = session?.user?.role === "HANDYMAN" && req.contactUnlocks.some((u) => u.handymanId === session.user.id);
  const requesterName = isOwner || handymanUnlocked ? fullRequesterName : getFirstName(fullRequesterName);
  const isRequesterVerified = (req.user?.emailVerified != null) || (req.user?.phoneVerified != null);
  const leadInput = {
    urgency: req.urgency,
    photos: req.photos,
    description: req.description,
    emailVerified: req.user?.emailVerified != null,
    phoneVerified: req.user?.phoneVerified != null,
  };
  const creditsRequired = getCreditsRequiredForLead(leadInput);
  const creditsBreakdown = getCreditsBreakdown(leadInput);
  const acceptedOffer = req.offers.find((o) => o.status === "ACCEPTED");

  let insufficientCredits = false;
  if (
    session?.user?.role === "HANDYMAN" &&
    !handymanUnlocked &&
    isCreditsRequired()
  ) {
    const { ok } = await hasEnoughCreditsForUnlock(
      prisma,
      session.user.id,
      creditsRequired
    );
    insufficientCredits = !ok;
  }

  if (session?.user?.role === "HANDYMAN" && !isOwner) {
    void trackFunnelEvent(prisma, "lead_viewed_by_handyman", { requestId: id }, session.user.id);
  }
  if (insufficientCredits) {
    void trackFunnelEvent(
      prisma,
      "insufficient_credits_seen",
      { requestId: id, creditsRequired },
      session?.user?.id ?? null
    );
  }

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
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
            {isRequesterVerified && (
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                Verifikovan korisnik
              </Badge>
            )}
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
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block relative h-24 w-24">
                    <Image src={url} alt="" width={96} height={96} className="rounded-lg object-cover" />
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
            <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-slate-50 p-6 shadow-inner md:p-7">
              <h3 className="font-display text-lg font-bold text-brand-navy">Uzmi kontakt korisnika</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Prije toga vidite opis posla, grad, kategoriju i slike ako ih ima.{" "}
                <strong className="font-semibold text-slate-800">Broj telefona i puni kontakt ne vidite odmah</strong> — to je namjerno,
                da se dogovor ide preko platforme.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Kada vam posao odgovara, potvrdite dolje: <strong className="font-semibold text-slate-800">tek tada se skidaju krediti</strong>, a
                dobijate kontakt da se javite i pošaljete ponudu.
              </p>
              <LeadPriceBreakdown breakdown={creditsBreakdown} />
              <div className="mt-5">
                <UnlockContactButton
                  requestId={req.id}
                  alreadyUnlocked={handymanUnlocked}
                  creditsRequired={creditsRequired}
                  insufficientCredits={insufficientCredits}
                />
              </div>
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

      {session?.user?.role === "HANDYMAN" && req.status === "OPEN" && handymanUnlocked && (
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

