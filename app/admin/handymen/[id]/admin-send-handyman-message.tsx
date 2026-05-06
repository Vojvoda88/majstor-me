"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminSendHandymanMessage({ handymanId }: { handymanId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/handymen/${handymanId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, sendEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Slanje poruke nije uspjelo.");
      }
      setStatus("Poruka je poslata majstoru.");
      setTitle("");
      setBody("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="admin-msg-title" className="mb-1 block text-sm font-medium text-slate-700">
          Naslov
        </label>
        <input
          id="admin-msg-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={120}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="npr. Završite profil za brže odobrenje"
        />
      </div>

      <div>
        <label htmlFor="admin-msg-body" className="mb-1 block text-sm font-medium text-slate-700">
          Poruka
        </label>
        <textarea
          id="admin-msg-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={5}
          maxLength={1200}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Unesite poruku koju majstor dobija kao notifikaciju."
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        Pošalji i email (pored in-app obavještenja)
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Slanje..." : "Pošalji poruku majstoru"}
        </Button>
        {status && <span className="text-sm text-emerald-700">{status}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
