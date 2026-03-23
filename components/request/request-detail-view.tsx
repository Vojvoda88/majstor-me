import Link from "next/link";
import Image from "next/image";
import type { Session } from "next-auth";
import {
  getCreditsRequiredForLead,
  isCreditsRequired,
  hasEnoughCreditsForUnlock,
} from "@/lib/credits";
import { getCreditsBreakdown } from "@/lib/lead-tier";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfferCard } from "@/components/lists/offer-card";
import { RequestDetailClient } from "@/app/request/[id]/request-detail-client";
import { SendOfferForm } from "@/components/forms/send-offer-form";
import { CancelRequestButton } from "@/components/request/cancel-request-button";
import { RequestSuccessBanner } from "@/components/request/request-success-banner";
import { RequestChatPanel } from "@/components/chat/request-chat-panel";
import { InviteHandymanForm } from "@/components/invite/invite-handyman-form";
import { UnlockContactButton } from "@/components/request/unlock-contact-button";
import { LeadPriceBreakdown } from "@/components/request/lead-price-breakdown";
import { UrgencyBadge } from "@/components/request/urgency-badge";
import { MapPin, Calendar, User } from "lucide-react";
import { trackFunnelEvent } from "@/lib/funnel-events";
import type { RequestDetailPayload } from "@/lib/requests/request-detail-include";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "-";
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export async function RequestDetailView({
  req,
  session,
  isOwner,
  guestAccessTokenPlain,
  isGuestAccessRoute,
}: {
  req: RequestDetailPayload;
  session: Session | null;
  isOwner: boolean;
  /** Plain token samo za guest vlasnika (accept ponude). */
  guestAccessTokenPlain?: string | null;
  /** Pristup preko /request-access/[token] — jači copy za success banner. */
  isGuestAccessRoute?: boolean;
}) {
  const { prisma } = await import("@/lib/db");
  const id = req.id;
  const fullRequesterName = req.user?.name ?? req.requesterName ?? "Korisnik";
  const handymanUnlocked =
    session?.user?.role === "HANDYMAN" && req.contactUnlocks.some((u) => u.handymanId === session.user.id);
  const requesterName = isOwner || handymanUnlocked ? fullRequesterName : getFirstName(fullRequesterName);
  const isRequesterVerified = req.user?.emailVerified != null || req.user?.phoneVerified != null;
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
  if (session?.user?.role === "HANDYMAN" && !handymanUnlocked && isCreditsRequired()) {
    const { ok } = await hasEnoughCreditsForUnlock(prisma, session.user.id, creditsRequired);
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

  const backHref =
    session?.user?.role === "USER"
      ? "/dashboard/user"
      : session?.user?.role === "HANDYMAN"
        ? "/dashboard/handyman"
        : "/";

  return (
    <>
      <Link href={backHref} className="mb-6 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]">
        ← Nazad
      </Link>

      {isOwner && (
        <RequestSuccessBanner
          adminStatus={req.adminStatus}
          urgency={req.urgency}
          guestTracking={!!(!req.userId && (guestAccessTokenPlain || isGuestAccessRoute))}
        />
      )}

      <Card className="rounded-xl bg-white shadow-sm transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#0F172A] sm:text-2xl">{req.title ?? req.category}</CardTitle>
          <p className="text-sm text-[#64748B]">{req.category}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                req.status === "COMPLETED" ? "success" : req.status === "CANCELLED" ? "secondary" : "default"
              }
              className={req.status === "IN_PROGRESS" ? "border-blue-200 bg-blue-100 text-blue-800" : undefined}
            >
              {STATUS_LABELS[req.status]}
            </Badge>
            <UrgencyBadge urgency={req.urgency} />
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
          {isOwner && req.status === "OPEN" && req.adminStatus === "PENDING_REVIEW" && (
            <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
              Zahtjev trenutno čeka pregled administratora. Nakon odobrenja, majstori će moći da vide zahtjev i da šalju
              ponude.
            </p>
          )}
          {isOwner && req.status === "OPEN" && req.adminStatus === "DISTRIBUTED" && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Zahtjev je odobren i prosleđen majstorima. Uskoro možete očekivati ponude.
            </p>
          )}
          {isOwner && req.status === "OPEN" && req.adminStatus === "HAS_OFFERS" && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
              Imate nove ponude — pogledajte ih ispod.
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
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="relative block h-24 w-24">
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
              <h3 className="font-display text-lg font-bold text-brand-navy">Otključaj kontakt za ovaj posao</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Pregled opisa, grada i slika je besplatan.{" "}
                <strong className="font-semibold text-slate-800">Plaćate samo kada želite kontakt</strong> — bez
                pretplate. Pošaljite ponudu za manje od 2&nbsp;€ u odnosu na klasične oglase (standardni kontakt je oko
                200 kredita ≈ 2&nbsp;€; hitnije oglase više).
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Prvo <strong className="font-semibold text-slate-800">otključavate kontakt kreditima</strong> (potvrda u
                koraku ispod). Tek onda vidite telefon / Viber / WhatsApp i možete poslati ponudu kroz formu ili direktno
                kontaktirati klijenta.
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
            <div className="border-t border-[#E2E8F0] pt-2">
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
              {session
                ? "Posao je u toku. Kada majstor završi, označite ga kao završen."
                : "Vaš izbor je primljen. Majstor će vas kontaktirati."}
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

      {session?.user?.role === "HANDYMAN" &&
        req.status === "IN_PROGRESS" &&
        acceptedOffer?.handymanId === session.user.id && (
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

      {isOwner && req.offers.length === 0 && (
        <Card className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
          <CardHeader>
            <CardTitle className="text-base">Ponude</CardTitle>
            <CardDescription>Još nema ponuda. Biće prikazane ovdje čim stignu.</CardDescription>
          </CardHeader>
        </Card>
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
                  guestAccessToken={isOwner && !req.userId ? guestAccessTokenPlain ?? undefined : undefined}
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
    </>
  );
}
