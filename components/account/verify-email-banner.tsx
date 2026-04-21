"use client";

import { useState } from "react";
import { MailCheck, X } from "lucide-react";

export function VerifyEmailBanner() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleResend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm">
      <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1">
        {status === "sent" ? (
          <p className="font-medium text-amber-800">
            Link poslan! Provjerite inbox (i spam folder) i kliknite na link.
          </p>
        ) : (
          <>
            <p className="font-medium text-amber-800">Email adresa nije verifikovana</p>
            <p className="mt-0.5 text-amber-700">
              Potvrdite email kako biste povećali povjerenje korisnika i osigurali nalog.
            </p>
            <button
              onClick={handleResend}
              disabled={status === "sending"}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              {status === "sending" ? "Šalje se..." : "Pošalji link za verifikaciju"}
            </button>
            {status === "error" && (
              <p className="mt-1.5 text-xs text-red-600">
                Greška pri slanju. Pokušajte ponovo ili kontaktirajte podršku.
              </p>
            )}
          </>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-500 hover:text-amber-700"
        aria-label="Zatvori"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
