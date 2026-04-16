"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmailVerificationReminder({ email }: { email?: string | null }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resend = async () => {
    if (!email || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setMessage("Poslali smo novi link za potvrdu emaila.");
      } else {
        setMessage(typeof json?.error === "string" ? json.error : "Pokušajte kasnije.");
      }
    } catch {
      setMessage("Greška pri slanju. Pokušajte kasnije.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Email još nije potvrđen.</p>
      <p className="mt-1 leading-relaxed text-amber-900/90">
        Možete normalno koristiti nalog i završiti profil. Potvrdu emaila možete uraditi naknadno.
      </p>
      {!!email && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-amber-300 text-amber-950"
          disabled={busy}
          onClick={() => void resend()}
        >
          {busy ? "Slanje..." : "Pošalji ponovo link za potvrdu"}
        </Button>
      )}
      {message && <p className="mt-2 text-xs text-amber-900">{message}</p>}
    </div>
  );
}
