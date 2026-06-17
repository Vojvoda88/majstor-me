"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CityRow = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  sortOrder: number;
};

export function CitiesManager({ cities, canEdit }: { cities: CityRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const [drafts, setDrafts] = useState<Record<string, CityRow>>(() => {
    const map: Record<string, CityRow> = {};
    for (const c of cities) map[c.id] = { ...c };
    return map;
  });

  const refresh = () => router.refresh();

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setCreateLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          ...(newSlug.trim() ? { slug: newSlug.trim() } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Kreiranje nije uspjelo.");
      setNewName("");
      setNewSlug("");
      setStatus("Grad je dodat.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setCreateLoading(false);
    }
  };

  const onSave = async (id: string) => {
    if (!canEdit) return;
    const draft = drafts[id];
    if (!draft) return;
    setLoadingId(id);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug ?? undefined,
          sortOrder: draft.sortOrder,
          active: draft.active,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Spremanje nije uspjelo.");
      setStatus("Grad je sačuvan.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoadingId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Obrisati ovaj grad iz baze?")) return;
    setLoadingId(id);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cities/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Brisanje nije uspjelo.");
      setStatus("Grad je obrisan.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {status ? <p className="text-sm font-medium text-emerald-700">{status}</p> : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <p className="text-sm text-[#64748B]">
        Javni listing i početna i dalje koriste statičke gradove iz koda dok se ne prebaci na dinamičko učitavanje.
        Ovdje možete pripremiti gradove u bazi za buduću upotrebu i administrativni pregled.
      </p>

      {!canEdit ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Samo pregled. Za izmjene potrebna je uloga Super admin ili Operations admin.
        </p>
      ) : (
        <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-sm font-semibold text-[#0F172A]">Novi grad</p>
          <div>
            <Label htmlFor="city-name">Naziv</Label>
            <Input id="city-name" value={newName} onChange={(e) => setNewName(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="city-slug">Slug (opciono)</Label>
            <Input
              id="city-slumb"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="npr. podgorica"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={createLoading}>
            {createLoading ? "Dodavanje…" : "Dodaj grad"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {cities.map((city) => {
          const draft = drafts[city.id] ?? city;
          return (
            <div key={city.id} className="rounded-xl border border-[#E2E8F0] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Naziv</Label>
                  <Input
                    value={draft.name}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [city.id]: { ...draft, name: e.target.value } }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={draft.slug ?? ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [city.id]: { ...draft, slug: e.target.value } }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Sort</Label>
                  <Input
                    type="number"
                    min={0}
                    disabled={!canEdit}
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [city.id]: { ...draft, sortOrder: Number(e.target.value) || 0 },
                      }))
                    }
                    className="mt-1 w-24"
                  />
                </div>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={draft.active}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [city.id]: { ...draft, active: e.target.checked } }))
                    }
                  />
                  Aktivan
                </label>
              </div>
              {canEdit ? (
                <div className="mt-3 flex gap-2">
                  <Button type="button" disabled={loadingId === city.id} onClick={() => onSave(city.id)}>
                    Sačuvaj
                  </Button>
                  <Button type="button" variant="outline" disabled={loadingId === city.id} onClick={() => onDelete(city.id)}>
                    Obriši
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
