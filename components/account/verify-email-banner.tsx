"use client";

import { useState } from "react";
import { MailCheck, X } from "lucide-react";
import { OpenInboxLink } from "@/components/account/open-inbox-link";
import { getWebmailInboxLink } from "@/lib/webmail-url";

export function VerifyEmailBanner({ userEmail }: { userEmail?: string | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleResend() {
    setStatus("sending");
    setErrorDetail(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorDetail(typeof json.error === "string" ? json.error : null);
      }
    } catch {
      setStatus("error");
      setErrorDetail(null);
    }
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm">
      <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1">
        {status === "sent" ? (
          <div className="space-y-2">
            <p className="font-medium text-amber-800">
              Zahtjev za slanje je prihvaćen. Poruka obično stigne za 1–3 minute. Otvorite inbox i
              provjerite <strong>Spam</strong> i <strong>Promocije</strong>. Ako ništa nema, u Resend
              panelu otvorite <strong>Logs</strong> i potražite ovaj email — tamo piše da li je isporučen
              ili odbijen.
            </p>
            {userEmail && getWebmailInboxLink(userEmail) && (
              <OpenInboxLink email={userEmail} variant="secondary" className="w-full" />
            )}
          </div>
        ) : (
          <>
            <p className="font-medium text-amber-800">Email adresa nije verifikovana</p>
            <p className="mt-0.5 text-amber-700">
              Potvrdite email kako biste povećali povjerenje korisnika i osigurali nalog.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                onClick={handleResend}
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {status === "sending" ? "Šalje se..." : "Pošalji link za verifikaciju"}
              </button>
              {userEmail && getWebmailInboxLink(userEmail) && (
                <OpenInboxLink email={userEmail} variant="secondary" className="flex-1 sm:flex-initial" />
              )}
            </div>
            {status === "error" && (
              <p className="mt-1.5 text-xs text-red-600">
                {errorDetail ??
                  "Greška pri slanju. Pokušajte ponovo, provjerite spam ili kontaktirajte podršku."}
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
