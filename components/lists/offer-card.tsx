"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PRICE_LABELS: Record<string, string> = {
  PO_DOGOVORU: "Po dogovoru",
  OKVIRNA: "Okvirna cijena",
  IZLAZAK_NA_TEREN: "Izlazak na teren",
  FIKSNA: "Fiksna cijena",
};

export function OfferCard({
  offer,
  isOwner,
  requestStatus,
}: {
  offer: {
    id: string;
    priceType: string;
    priceValue: number | null;
    message: string | null;
    proposedDate: Date | null;
    status: string;
    handyman: {
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
}) {
  const router = useRouter();
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offers/${offer.id}/accept`, { method: "POST" });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri prihvatanju";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{offer.handyman.name}</p>
          {offer.handyman.handymanProfile && (
            <p className="text-sm text-muted-foreground">
              ★ {offer.handyman.handymanProfile.ratingAvg.toFixed(1)} ({offer.handyman.handymanProfile.reviewCount} recenzija)
            </p>
          )}
          <p className="mt-1 text-sm">
            {PRICE_LABELS[offer.priceType]}
            {offer.priceType === "FIKSNA" && offer.priceValue != null && (
              <> • {offer.priceValue} €</>
            )}
          </p>
          {offer.message && (
            <p className="mt-2 text-sm text-muted-foreground">{offer.message}</p>
          )}
        </div>
        {isOwner && requestStatus === "OPEN" && offer.status === "PENDING" && (
          <div className="flex flex-col items-end gap-1">
            {acceptMutation.error && (
              <p className="text-xs text-destructive">{acceptMutation.error.message}</p>
            )}
            <Button
              size="sm"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? "..." : "Prihvati ponudu"}
            </Button>
          </div>
        )}
      </div>
      {offer.status === "ACCEPTED" && (
        <Badge variant="success" className="mt-2">Prihvaćeno</Badge>
      )}
    </div>
  );
}
