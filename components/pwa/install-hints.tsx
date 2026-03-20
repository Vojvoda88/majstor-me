"use client";

import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: string }>;
  userChoice: Promise<{ outcome: string }>;
}

/** Uputstva za iOS / Android + dugme kad Chrome ponudi instalaciju */
export function InstallHints() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [busy, setBusy] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      setCanPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const handleInstall = async () => {
    const p = deferred.current;
    if (!p) return;
    setBusy(true);
    try {
      await p.prompt();
      await p.userChoice;
    } finally {
      setBusy(false);
      deferred.current = null;
      setCanPrompt(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {canPrompt && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
          <p className="text-sm font-semibold text-brand-navy">Tvoj browser nudi instalaciju</p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-[#2563EB] py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:opacity-70"
          >
            {busy ? "Čekaj…" : "Instaliraj sada"}
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-brand-navy">iPhone / iPad (Safari)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>Otvori brzimajstor.me u <strong>Safari</strong> (ne u Chrome/Facebook in-app browseru ako možeš).</li>
          <li>Pritisni dugme <strong>Dijeli</strong> (kvadrat sa strelicom).</li>
          <li>Izaberi <strong>Dodaj na početni ekran</strong> (Add to Home Screen).</li>
          <li>Potvrdi naziv i pritisni <strong>Dodaj</strong>.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-brand-navy">Android (Chrome)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>Otvori sajt u <strong>Chrome</strong>.</li>
          <li>Ako se pojavi poruka „Instaliraj aplikaciju“ ili ikona instalacije u meniju — prati korake.</li>
          <li>Ili: meni (⋮) → <strong>Instaliraj aplikaciju</strong> / <strong>Add to Home screen</strong>.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-display text-lg font-bold text-brand-navy">Zašto ne vidim „Instaliraj“?</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
          <li>Na iPhone-u <strong>ne postoji</strong> isti dijalog kao na Androidu — uvijek preko Dijeli → Početni ekran.</li>
          <li>Ako si već dodao aplikaciju ili je otvoriš iz „installed“ moda, ponuda se ne prikazuje.</li>
          <li>Sajt mora biti otvoren preko <strong>HTTPS</strong> (produkcija na domeni).</li>
        </ul>
      </section>
    </div>
  );
}
