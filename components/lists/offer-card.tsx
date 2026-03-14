"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, MapPin, Calendar, MessageSquare } from "lucide-react";

const PRICE_LABELS: Record<string, string> = {
  PO_DOGOVORU: "Po dogovoru",
  OKVIRNA: "Okvirna cijena",
  IZLAZAK_NA_TEREN: "Potreban izlazak na teren",
  FIKSNA: "Fiksna cijena",
};

export function OfferCard({
  offer,
  isOwner,
  requestStatus,
  requesterToken,
}: {
  offer: {
    id: string;
    priceType: string;
    priceValue: number | null;
    message: string | null;
    proposedDate: Date | null;
    proposedArrival?: string | null;
    status: string;
    handyman: {
      id: string;
      name: string;
      city: string | null;
      handymanProfile: {
        bio: string | null;
        ratingAvg: number;
        reviewCount: number;
        verifiedStatus: string;
      } | null;
    };
  };
  isOwner: boolean;
  requestStatus: string;
  requesterToken?: string | null;
}) {
  const router = useRouter();
  const profile = offer.handyman.handymanProfile;
  const isVerified = profile?.verifiedStatus === "VERIFIED";

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offers/${offer.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requesterToken ? { token: requesterToken } : {}),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri prihvatanju";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div
      className={`rounded-xl p-5 shadow-sm transition sm:p-6 ${
        offer.status === "ACCEPTED"
          ? "border-2 border-green-200 bg-green-50/50"
          : "bg-white hover:shadow-md"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/handyman/${offer.handyman.id}`}
              className="font-semibold text-[#0F172A] hover:text-[#2563EB]"
            >
              {offer.handyman.name}
            </Link>
            {isVerified && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verifikovan
              </Badge>
            )}
            {offer.status === "ACCEPTED" && (
              <Badge variant="success">Prihvaćeno</Badge>
            )}
          </div>
          {profile && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                {profile.ratingAvg.toFixed(1)}
              </span>
              <span>{profile.reviewCount} recenzija</span>
              {offer.handyman.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {offer.handyman.city}
                </span>
              )}
            </div>
          )}
          <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
            <p className="font-medium text-[#0F172A]">
              {PRICE_LABELS[offer.priceType]}
              {offer.priceType === "FIKSNA" && offer.priceValue != null && (
                <span className="text-[#2563EB]"> • {offer.priceValue} €</span>
              )}
            </p>
            {(offer.proposedDate || offer.proposedArrival) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                <Calendar className="h-4 w-4" />
                {offer.proposedArrival || (offer.proposedDate ? `Predloženi datum: ${new Date(offer.proposedDate).toLocaleDateString("sr")}` : "")}
              </p>
            )}
          </div>
          {offer.message && (
            <div className="flex gap-2 text-sm text-[#64748B]">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <p>{offer.message}</p>
            </div>
          )}
        </div>
        {isOwner && requestStatus === "OPEN" && offer.status === "PENDING" && (
          <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
            {acceptMutation.error && (
              <p className="text-xs text-[#DC2626]">{acceptMutation.error.message}</p>
            )}
            <Button
              size="lg"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="h-14 min-h-[48px] w-full sm:h-10 sm:min-h-0 sm:w-auto"
            >
              {acceptMutation.isPending ? "Prihvatanje..." : "Prihvati ponudu"}
            </Button>
            <Link
              href={`/handyman/${offer.handyman.id}`}
              className="text-center text-sm text-[#2563EB] hover:underline sm:text-right"
            >
              Pogledaj profil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
