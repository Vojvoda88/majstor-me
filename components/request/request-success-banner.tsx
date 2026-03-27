"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UrgencyLevel } from "@prisma/client";

type AdminStatus = string | null | undefined;

export function RequestSuccessBanner({
  adminStatus,
  urgency,
  guestTracking,
}: {
  adminStatus: AdminStatus;
  urgency: UrgencyLevel;
  /** Guest / privatni link — jači savjet da se link sačuva. */
  guestTracking?: boolean;
}) {
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const [copyState, setCopyState] = useState<"idle" | "ok" | "error">("idle");

  if (!created) return null;

  const guestTrackingLink = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.location.href;
  }, []);

  useEffect(() => {
    if (!guestTracking) return;
    if (typeof window === "undefined") return;
    const link = window.location.href;
    window.localStorage.setItem("bm:lastGuestRequestLink", link);
    window.localStorage.setItem("bm:lastGuestRequestSavedAt", String(Date.now()));
  }, [guestTracking]);

  useEffect(() => {
    if (copyState === "idle") return;
    const t = window.setTimeout(() => setCopyState("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [copyState]);

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    const text = guestTrackingLink ?? window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!copied) throw new Error("COPY_FAILED");
      }
      setCopyState("ok");
    } catch {
      setCopyState("error");
    }
  };

  const pending =
    adminStatus === "PENDING_REVIEW" || adminStatus === null || adminStatus === undefined;
  const distributed = adminStatus === "DISTRIBUTED";
  const urgentPriority =
    urgency === "HITNO_DANAS" || urgency === "U_NAREDNA_2_DANA";

  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600 sm:h-8 sm:w-8" />
        <div className="min-w-0 flex-1">
          {pending ? (
            <>
              <h3 className="text-base font-semibold text-emerald-900 sm:text-lg">Zahtjev je uspješno primljen</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                Administrator će uskoro pregledati vaš zahtjev. Nakon odobrenja, majstori će moći da vide zahtjev i da
                šalju ponude.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                {guestTracking ? (
                  <>
                    Status zahtjeva možete pratiti preko privatnog linka ispod. Sačuvajte ovaj link kako biste kasnije
                    vidjeli ponude i status zahtjeva.
                  </>
                ) : (
                  <>
                    Status možete pratiti na ovoj stranici. Ako ste prijavljeni, obavještenja su i u vašem nalogu.
                  </>
                )}
              </p>
              {urgentPriority && (
                <p className="mt-2 text-sm font-medium text-emerald-900">
                  Hitni zahtjevi se pregledavaju prioritetno.
                </p>
              )}
            </>
          ) : distributed ? (
            <>
              <h3 className="text-base font-semibold text-emerald-900 sm:text-lg">Zahtjev je odobren</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                Prosleđen je majstorima u vašoj oblasti. Uskoro možete očekivati ponude.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-emerald-900 sm:text-lg">Zahtjev je uspješno primljen</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                Pratite ovu stranicu za ažuriranja i ponude.
              </p>
            </>
          )}
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={copyLink}
              className="h-12 min-h-[44px] w-full gap-1 border-emerald-300 text-emerald-800 sm:h-9 sm:min-h-0 sm:w-auto"
            >
              <Share2 className="h-4 w-4" />
              {copyState === "ok"
                ? "Kopirano"
                : guestTracking
                  ? "Sačuvaj link za praćenje (kopiraj)"
                  : "Podijeli zahtjev (kopiraj link)"}
            </Button>
            {copyState === "ok" && (
              <p className="mt-2 text-xs font-medium text-emerald-800">
                Link je kopiran. Sačuvajte ga za kasniji povratak.
              </p>
            )}
            {copyState === "error" && (
              <p className="mt-2 text-xs font-medium text-amber-900">
                Kopiranje nije uspjelo. Ručno kopirajte adresu iz browser trake.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
