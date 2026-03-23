"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UrgencyLevel } from "@prisma/client";

type AdminStatus = string | null | undefined;

export function RequestSuccessBanner({
  adminStatus,
  urgency,
}: {
  adminStatus: AdminStatus;
  urgency: UrgencyLevel;
}) {
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";

  if (!created) return null;

  const copyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
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
                Bićete obaviješteni u aplikaciji kada zahtjev bude pregledan i odobren.
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
              Podijeli zahtjev (kopiraj link)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
