"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALLOWED = ["PENDING", "CONTACTED", "COMPLETED", "REJECTED"] as const;

const LABELS: Record<(typeof ALLOWED)[number], string> = {
  PENDING: "Na čekanju",
  CONTACTED: "Kontaktiran",
  COMPLETED: "Završeno",
  REJECTED: "Odbijeno",
};

function normalizeStatus(raw: string): (typeof ALLOWED)[number] {
  if (raw === "DONE") return "COMPLETED";
  if (raw === "CANCELLED") return "REJECTED";
  if ((ALLOWED as readonly string[]).includes(raw)) return raw as (typeof ALLOWED)[number];
  return "PENDING";
}

type Props = {
  requestId: string;
  initialStatus: string;
};

export function CashActivationStatusCell({ requestId, initialStatus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(normalizeStatus(initialStatus));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(normalizeStatus(initialStatus));
  }, [initialStatus]);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty = normalizeStatus(initialStatus) !== value;

  async function save() {
    setBusy(true);
    setError(null);
    setSavedFlash(false);
    try {
      const res = await fetch(`/api/admin/credits/cash-activations/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: value }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Sačuvavanje nije uspjelo");
        return;
      }
      setSavedFlash(true);
      router.refresh();
      setTimeout(() => setSavedFlash(false), 2500);
    } catch {
      setError("Mrežna greška");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[160px] flex-col gap-1">
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value as (typeof ALLOWED)[number]);
          setError(null);
        }}
        disabled={busy}
        className="h-8 rounded border border-[#E2E8F0] bg-white px-2 text-xs text-[#0F172A]"
        aria-label="Status zahtjeva za keš aktivaciju"
      >
        {ALLOWED.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {dirty && (
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded bg-[#2563EB] px-2 py-1 text-xs font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          {busy ? "…" : "Sačuvaj"}
        </button>
      )}
      {savedFlash && <span className="text-xs text-green-600">Ažurirano</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
