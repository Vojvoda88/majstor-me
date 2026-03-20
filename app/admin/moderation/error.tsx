"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ModerationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Moderation]", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 text-center">
      <h1 className="text-lg font-bold text-[#0F172A]">Greška pri učitavanju moderacije</h1>
      <p className="mt-2 text-sm text-[#64748B]">
        Pokušaj ponovo ili se vrati na dashboard. Ako se ponavlja, provjeri logove servera (digest:{" "}
        <code className="rounded bg-white px-1 text-xs">{error.digest ?? "—"}</code>).
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Pokušaj ponovo
        </button>
        <Link href="/admin" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50">
          Na dashboard
        </Link>
      </div>
    </div>
  );
}
