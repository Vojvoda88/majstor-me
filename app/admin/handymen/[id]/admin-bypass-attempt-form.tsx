"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ViolationReason = "PHONE_NUMBER" | "INAPPROPRIATE_CONTENT";
type ViolationLocation = "AVATAR" | "BIO" | "GALLERY";

const REASONS: { id: ViolationReason; label: string }[] = [
  { id: "PHONE_NUMBER", label: "Pronađen broj telefona / kontakt podaci" },
  { id: "INAPPROPRIATE_CONTENT", label: "Neprimjeren sadržaj" },
];

const LOCATIONS: { id: ViolationLocation; label: string }[] = [
  { id: "AVATAR", label: "Profilna fotografija" },
  { id: "BIO", label: "Opis profila" },
  { id: "GALLERY", label: "Fotografije radova" },
];

export function AdminBypassAttemptForm({ handymanId }: { handymanId: string }) {
  const [open, setOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [reasons, setReasons] = useState<ViolationReason[]>(["PHONE_NUMBER"]);
  const [locations, setLocations] = useState<ViolationLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleArrayValue = <T extends string>(value: T, list: T[], setList: (next: T[]) => void) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/handymen/${handymanId}/bypass-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasons, locations, sendEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Slanje upozorenja nije uspjelo.");
      }
      setStatus("Upozorenje je poslato majstoru.");
      setLocations([]);
      setReasons(["PHONE_NUMBER"]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" variant="destructive" onClick={() => setOpen((v) => !v)}>
        {open ? "Zatvori upozorenje" : "Pokušaj zaobilaženja"}
      </Button>

      {open && (
        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            Označite gdje je pronađeno kršenje i pošaljite automatsko upozorenje.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">Gdje je pronađeno:</p>
            <div className="space-y-1">
              {LOCATIONS.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={locations.includes(item.id)}
                    onChange={() => toggleArrayValue(item.id, locations, setLocations)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">Razlog:</p>
            <div className="space-y-1">
              {REASONS.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={reasons.includes(item.id)}
                    onChange={() => toggleArrayValue(item.id, reasons, setReasons)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Pošalji i email
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Slanje..." : "Pošalji upozorenje"}
            </Button>
            {status && <span className="text-sm text-emerald-700">{status}</span>}
            {error && <span className="text-sm text-red-700">{error}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
