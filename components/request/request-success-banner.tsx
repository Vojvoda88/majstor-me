"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RequestSuccessBanner({
  requestId,
  handymenNotified,
}: {
  requestId: string;
  handymenNotified?: number;
}) {
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const notified = handymenNotified ?? parseInt(searchParams.get("notified") ?? "0", 10);

  if (!created) return null;

  const copyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-wrap items-start gap-3">
        <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
        <div>
          <h3 className="font-semibold text-emerald-900">Zahtjev uspješno objavljen</h3>
          {notified > 0 ? (
            <p className="mt-1 text-sm text-emerald-800">
              Obavijestili smo {notified} majstora u vašoj oblasti. Očekujte prve ponude uskoro.
            </p>
          ) : (
            <p className="mt-1 text-sm text-emerald-800">
              Majstori će vidjeti vaš zahtjev. Očekujte ponude uskoro.
            </p>
          )}
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={copyLink}
              className="gap-1 border-emerald-300 text-emerald-800"
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
