"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
};

export function FaqManager({ items, canEdit }: { items: FaqRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const [drafts, setDrafts] = useState<Record<string, Partial<FaqRow>>>(() => {
    const map: Record<string, Partial<FaqRow>> = {};
    for (const item of items) {
      map[item.id] = { ...item };
    }
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
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Kreiranje nije uspjelo.");
      setNewQuestion("");
      setNewAnswer("");
      setStatus("FAQ stavka je dodata.");
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
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: draft.question,
          answer: draft.answer,
          sortOrder: draft.sortOrder,
          active: draft.active,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Spremanje nije uspjelo.");
      setStatus("Stavka je sačuvana.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoadingId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Obrisati ovu FAQ stavku?")) return;
    setLoadingId(id);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Brisanje nije uspjelo.");
      setStatus("Stavka je obrisana.");
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

      {!canEdit ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Samo pregled. Za izmjene potrebna je uloga sa dozvolom za uređivanje sadržaja.
        </p>
      ) : null}

      {canEdit ? (
        <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-sm font-semibold text-[#0F172A]">Nova FAQ stavka</p>
          <div>
            <Label htmlFor="faq-new-q">Pitanje</Label>
            <Input
              id="faq-new-q"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="faq-new-a">Odgovor</Label>
            <Textarea
              id="faq-new-a"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              required
              rows={4}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={createLoading}>
            {createLoading ? "Dodavanje…" : "Dodaj stavku"}
          </Button>
        </form>
      ) : null}

      <ul className="space-y-4">
        {items.map((item) => {
          const draft = drafts[item.id] ?? item;
          return (
            <li key={item.id} className="rounded-2xl border border-[#E2E8F0] p-4">
              <div className="space-y-3">
                <div>
                  <Label>Pitanje</Label>
                  <Input
                    value={draft.question ?? ""}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: { ...draft, question: e.target.value },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Odgovor</Label>
                  <Textarea
                    value={draft.answer ?? ""}
                    disabled={!canEdit}
                    rows={4}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: { ...draft, answer: e.target.value },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <Label>Sort</Label>
                    <Input
                      type="number"
                      min={0}
                      disabled={!canEdit}
                      value={draft.sortOrder ?? 0}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...draft, sortOrder: Number(e.target.value) || 0 },
                        }))
                      }
                      className="mt-1 w-24"
                    />
                  </div>
                  <label className="flex items-center gap-2 pb-2 text-sm">
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={draft.active ?? true}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...draft, active: e.target.checked },
                        }))
                      }
                    />
                    Aktivno (javno)
                  </label>
                </div>
                {canEdit ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={loadingId === item.id} onClick={() => onSave(item.id)}>
                      {loadingId === item.id ? "Čuvanje…" : "Sačuvaj"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loadingId === item.id}
                      onClick={() => onDelete(item.id)}
                    >
                      Obriši
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#64748B]">
            Nema FAQ u bazi — početna koristi statički fallback dok ne dodate stavke ovdje.
          </p>
        ) : null}
      </ul>
    </div>
  );
}
