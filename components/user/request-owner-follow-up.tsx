"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  requestId: string;
  variant: "in_progress" | "open_resolved_elsewhere";
};

export function RequestOwnerFollowUp({ requestId, variant }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patchStatus(next: "COMPLETED" | "CANCELLED") {
    setError(null);
    setLoading(next === "COMPLETED" ? "complete" : "cancel");
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
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

  const completing =
    variant === "in_progress"
      ? { label: "Označi posao završenim", hint: "Dogovorili ste se sa majstorom preko platforme." }
      : {
          label: "Posao riješen",
          hint: "Zatvorite oglas ako ste riješili posao (i van platforme). Majstori sa neodgovorenim ponudama će biti obavješteni.",
        };

  return (
    <div className="border-t border-amber-100 bg-amber-50/90 px-4 py-3 sm:px-6">
      <p className="text-sm font-medium text-amber-950">Potvrdi status zahtjeva</p>
      <p className="mt-1 text-xs text-amber-900/85">{completing.hint}</p>
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
                  "Zatvoriti oglas kao riješen? Neodgovorene ponude će biti povučene i majstori obaviješteni."
                )
              ) {
                return;
              }
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
