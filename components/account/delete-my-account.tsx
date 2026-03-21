"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteMyAccount() {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const performDelete = useCallback(async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await signOut({ callbackUrl: "/" });
        window.location.href = "/";
      } else {
        const base = data.error ?? "Greška";
        const dbg =
          typeof data === "object" &&
          data !== null &&
          "debug" in data &&
          data.debug != null
            ? `\n\nDetalji (dev): ${JSON.stringify((data as { debug: unknown }).debug)}`
            : "";
        alert(base + dbg);
      }
    } catch {
      alert("Greška pri brisanju");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  return (
    <>
      <Card className="border-red-100 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-base text-[#0F172A]">Obriši moj nalog</CardTitle>
          <p className="text-sm text-[#64748B]">
            Trajno obrišite svoj nalog i sve povezane podatke. Nakon brisanja morat ćete se ponovo
            registrovati da biste koristili uslugu.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
          >
            {loading ? "Brisanje…" : "Obriši nalog"}
          </Button>
        </CardContent>
      </Card>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          aria-describedby="delete-account-desc"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Zatvori"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative z-[101] w-full max-w-md rounded-xl border border-red-100 bg-white p-6 shadow-xl">
            <h2 id="delete-account-title" className="text-lg font-semibold text-[#0F172A]">
              Potvrdite brisanje naloga
            </h2>
            <p id="delete-account-desc" className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Da li ste sigurni? Vaš nalog i svi povezani podaci biće{" "}
              <strong className="text-[#0F172A]">trajno obrisani</strong>. Ova akcija se ne može
              poništiti.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
              >
                Otkaži
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void performDelete()}
                disabled={loading}
              >
                Da, obriši nalog
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
