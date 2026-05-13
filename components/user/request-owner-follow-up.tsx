"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  requestId: string;
  variant: "in_progress" | "open_resolved_elsewhere";
  /** Guest zahtjev — šalje se u PATCH tijelu zajedno sa statusom. */
  guestAccessToken?: string;
  offers?: { id: string; status: string; handymanName: string }[];
};

export function RequestOwnerFollowUp({ requestId, variant, guestAccessToken, offers = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState("");

  async function patchStatus(next: "COMPLETED" | "CANCELLED") {
    setError(null);
    setLoading(next === "COMPLETED" ? "complete" : "cancel");
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          guestAccessToken ? { status: next, guestAccessToken } : { status: next }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.success) {
        throw new Error(typeof json?.error === "string" ? json.error : "Greška pri snimanju");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška pri snimanju");
    } finally {
      setLoading(null);
    }
  }

  async function acceptOfferAndComplete(offerId: string) {
    const res = await fetch(`/api/offers/${offerId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guestAccessToken ? { token: guestAccessToken } : {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!json?.success) {
      throw new Error(typeof json?.error === "string" ? json.error : "Greška pri odabiru majstora");
    }
    await patchStatus("COMPLETED");
  }

  const completing =
    variant === "in_progress"
      ? { label: "Označi posao završenim", hint: "Dogovorili ste se sa majstorom preko platforme." }
      : {
          label: "Posao riješen",
          hint: "Zatvorite oglas kada je posao dogovoren. Majstori sa neodgovorenim ponudama će biti obaviješteni da je zahtjev zatvoren.",
        };
  const pendingOffers = offers.filter((o) => o.status === "PENDING");

  return (
    <div className="border-t border-amber-100 bg-amber-50/90 px-4 py-3 sm:px-6">
      <p className="text-sm font-medium text-amber-950">Potvrdi status zahtjeva</p>
      <p className="mt-1 text-xs text-amber-900/85">{completing.hint}</p>
      {variant === "open_resolved_elsewhere" && pendingOffers.length > 0 && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-amber-950">
            Opciono: izaberi majstora sa kojim je dogovoreno (za kasniju ocjenu)
          </label>
          <select
            className="h-10 w-full rounded-md border border-amber-300 bg-white px-3 text-sm text-slate-800"
            value={selectedOfferId}
            disabled={loading !== null}
            onChange={(e) => setSelectedOfferId(e.target.value)}
          >
            <option value="">Nije izabran (samo zatvori oglas)</option>
            {pendingOffers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.handymanName}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          disabled={loading !== null}
          onClick={() => {
            if (variant === "open_resolved_elsewhere") {
              if (
                !window.confirm(
                  "Označiti posao kao dogovoren? Neodgovorene ponude će biti povučene i zahtjev zaključan."
                )
              ) {
                return;
              }
            }
            if (variant === "open_resolved_elsewhere" && selectedOfferId) {
              void (async () => {
                setError(null);
                setLoading("complete");
                try {
                  await acceptOfferAndComplete(selectedOfferId);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Greška pri snimanju");
                  setLoading(null);
                }
              })();
              return;
            }
            void patchStatus("COMPLETED");
          }}
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading === "complete" ? "Snimam…" : completing.label}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
          disabled={loading !== null}
          onClick={() => {
            if (
              !window.confirm(
                "Otkazati zahtjev? Majstori sa aktivnim ponudama dobiće obavještenje da je zahtjev otkazan."
              )
            ) {
              return;
            }
            void patchStatus("CANCELLED");
          }}
        >
          <XCircle className="h-4 w-4" />
          {loading === "cancel" ? "Snimam…" : "Otkaži zahtjev"}
        </Button>
      </div>
    </div>
  );
}
