"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import { t } from "@/lib/i18n/messages";

function formatWhen(tsRaw: string | null, locale: string): string | null {
  if (!tsRaw) return null;
  const ts = Number(tsRaw);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return new Date(ts).toLocaleString(locale);
}

export function GuestRequestReturnCard() {
  const locale = useUiLanguage();
  const [link, setLink] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLink = window.localStorage.getItem("bm:lastGuestRequestLink");
    if (!savedLink?.trim()) return;
    setLink(savedLink);
    setSavedAt(formatWhen(window.localStorage.getItem("bm:lastGuestRequestSavedAt"), locale));
  }, [locale]);

  if (!link) return null;

  return (
    <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
      <p className="text-sm font-semibold text-sky-950">{t(locale, "request.guestLink.title", "Imate sačuvan privatni link za praćenje zahtjeva")}</p>
      <p className="mt-1 text-xs text-sky-900">
        {savedAt
          ? t(locale, "request.guestLink.savedAt", "Sačuvano: {date}.").replace("{date}", savedAt)
          : t(locale, "request.guestLink.savedOnDevice", "Sačuvano na ovom uređaju.")}
        {" "}
        {t(locale, "request.guestLink.continueHint", "Možete odmah nastaviti gde ste stali.")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-xl">
          <Link href={link}>{t(locale, "request.guestLink.continueButton", "Nastavi praćenje zahtjeva")}</Link>
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
          {t(locale, "request.guestLink.removeButton", "Ukloni sačuvani link")}
        </Button>
      </div>
    </div>
  );
}

