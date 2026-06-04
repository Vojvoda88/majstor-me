"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTED_KEYS = ["CREDITS_PER_CONTACT_UNLOCK", "CREDITS_REQUIRED"];

export function SettingsEditor({
  settings,
  canEdit,
}: {
  settings: { key: string; value: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [key, setKey] = useState(SUGGESTED_KEYS[0] ?? "");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim().toUpperCase(), value }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Spremanje nije uspjelo.");
      setStatus(`Podešavanje ${key} je sačuvano.`);
      setValue("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoading(false);
    }
  };

  const loadExisting = (k: string) => {
    const row = settings.find((s) => s.key === k);
    setKey(k);
    setValue(row?.value ?? "");
  };

  return (
    <div className="space-y-4">
      {status ? <p className="text-sm font-medium text-emerald-700">{status}</p> : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      {!canEdit ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Samo pregled. Za izmjene potrebna je uloga sa dozvolom settings_write.
        </p>
      ) : (
        <form onSubmit={onSave} className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-sm font-semibold text-[#0F172A]">Uredi ili dodaj ključ</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => loadExisting(k)}
              >
                {k}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="setting-key">Ključ (VELIKA_SLOVA)</Label>
            <Input
              id="setting-key"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              required
              pattern="[A-Z0-9_]+"
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="setting-value">Vrijednost</Label>
            <Textarea
              id="setting-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              rows={3}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Čuvanje…" : "Sačuvaj podešavanje"}
          </Button>
        </form>
      )}
    </div>
  );
}
