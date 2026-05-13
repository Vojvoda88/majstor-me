"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { REQUEST_CATEGORY_FALLBACK, REQUEST_CREATE_CATEGORY_CHOICES } from "@/lib/constants";
import { displayLabelForRequestCategory } from "@/lib/categories";

const CHOICE_SET = new Set(REQUEST_CREATE_CATEGORY_CHOICES as readonly string[]);

export function AdminRequestExtraCategoriesPanel({
  requestId,
  primaryCategory,
  initialExtras,
  canWrite,
  canDistribute,
}: {
  requestId: string;
  primaryCategory: string;
  initialExtras: readonly string[];
  canWrite: boolean;
  /** Zahtjev je u statusu gdje majstori smiju vidjeti lead (npr. DISTRIBUTED) */
  canDistribute: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pick, setPick] = useState("");

  const addableOptions = useMemo(() => {
    const blocked = new Set<string>([primaryCategory, ...initialExtras]);
    return (REQUEST_CREATE_CATEGORY_CHOICES as readonly string[]).filter(
      (c) => c !== REQUEST_CATEGORY_FALLBACK && !blocked.has(c)
    );
  }, [primaryCategory, initialExtras]);

  const callApi = async (body: { action: "add" | "remove"; category: string }) => {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/extra-distribution-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: { handymenNotified?: number };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Zahtjev nije uspio");
      }
      if (body.action === "add" && typeof json.data?.handymenNotified === "number") {
        setOk(`Dodata kategorija; novi talas notifikacija: ${json.data.handymenNotified} majstor(a).`);
      } else {
        setOk("Sačuvano.");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onAdd = () => {
    const c = pick.trim();
    if (!c || !CHOICE_SET.has(c) || c === REQUEST_CATEGORY_FALLBACK) {
      setError("Izaberite kategoriju iz liste.");
      return;
    }
    void callApi({ action: "add", category: c });
  };

  const onRemove = (category: string) => {
    if (!confirm(`Ukloniti dodatnu kategoriju „${displayLabelForRequestCategory(category)}”?`)) return;
    void callApi({ action: "remove", category });
  };

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dodatne kategorije za obavještenja majstorima</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#64748B]">Nemate dozvolu za izmjene zahtjeva.</p>
          {initialExtras.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm">
              {initialExtras.map((c) => (
                <li key={c}>{displayLabelForRequestCategory(c)}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dodatne kategorije za obavještenja majstorima</CardTitle>
        <p className="text-sm text-[#64748B]">
          Glavna kategorija zahtjeva ostaje <strong className="font-medium text-slate-800">{primaryCategory}</strong>.
          Ovdje možete ručno dodati još jednu uslugu da <strong className="font-medium text-slate-800">dodatno</strong>{" "}
          obavijestite majstore u toj kategoriji (npr. sitni kućni poslovi uz vodoinstalatera). Nema automatskog
          povezivanja — samo ono što dodate. Majstori koji su već dobili obavještenje neće duplikat.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canDistribute && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Dodavanje i talas notifikacija mogu tek kad je zahtjev odobren za distribuciju majstorima (npr. status
            „Distribuiran“).
          </p>
        )}

        {initialExtras.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Aktivne dodatne</p>
            <ul className="space-y-2">
              {initialExtras.map((c) => (
                <li
                  key={c}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>{displayLabelForRequestCategory(c)}</span>
                  <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => onRemove(c)}>
                    Ukloni iz liste
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="extra-cat-pick">Dodaj kategoriju</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <select
              id="extra-cat-pick"
              className="min-h-[44px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              disabled={loading || !canDistribute || addableOptions.length === 0}
            >
              <option value="">— izaberite —</option>
              {addableOptions.map((c) => (
                <option key={c} value={c}>
                  {displayLabelForRequestCategory(c)}
                </option>
              ))}
            </select>
            <Button
              type="button"
              disabled={loading || !canDistribute || !pick || addableOptions.length === 0}
              onClick={() => onAdd()}
            >
              {loading ? "Slanje…" : "Dodaj i obavijesti"}
            </Button>
          </div>
          {addableOptions.length === 0 && canDistribute && (
            <p className="text-xs text-slate-500">Nema više dostupnih kategorija za dodavanje.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-700">{ok}</p>}
      </CardContent>
    </Card>
  );
}
