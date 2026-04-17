"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function formatWhen(tsRaw: string | null): string | null {
  if (!tsRaw) return null;
  const ts = Number(tsRaw);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return new Date(ts).toLocaleString("sr");
}

export function GuestRequestReturnCard() {
  const [link, setLink] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLink = window.localStorage.getItem("bm:lastGuestRequestLink");
    if (!savedLink?.trim()) return;
    setLink(savedLink);
    setSavedAt(formatWhen(window.localStorage.getItem("bm:lastGuestRequestSavedAt")));
  }, []);

  if (!link) return null;

  return (
    <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
      <p className="text-sm font-semibold text-sky-950">Imate sačuvan privatni link za praćenje zahtjeva</p>
      <p className="mt-1 text-xs text-sky-900">
        {savedAt ? `Sačuvano: ${savedAt}.` : "Sačuvano na ovom uređaju."} Možete odmah nastaviti gde ste stali.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-xl">
          <Link href={link}>Nastavi praćenje zahtjeva</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => {
            if (typeof window === "undefined") return;
            window.localStorage.removeItem("bm:lastGuestRequestLink");
            window.localStorage.removeItem("bm:lastGuestRequestSavedAt");
            setLink(null);
          }}
        >
          Ukloni sačuvani link
        </Button>
      </div>
    </div>
  );
}

