"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Link2 } from "lucide-react";

type Props = {
  requestId: string;
  /** null = guest zahtjev */
  userId: string | null;
  /** Postoji li (ili je postojao) guest pristup preko linka */
  hadGuestToken: boolean;
  canReissue: boolean;
};

export function AdminGuestAccessPanel({ requestId, userId, hadGuestToken, canReissue }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ accessUrl: string; token: string } | null>(null);
  const [copied, setCopied] = useState<"url" | "token" | null>(null);

  if (userId != null) {
    return null;
  }

  const copyText = async (label: "url" | "token", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Kopiranje nije uspjelo (browser). Označite tekst ručno.");
    }
  };

  const reissue = async () => {
    setError(null);
    setLoading(true);
    setIssued(null);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/reissue-guest-access`, { method: "POST" });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { accessUrl?: string; token?: string };
      };
      if (!res.ok || !json.success || !json.data?.accessUrl || !json.data?.token) {
        setError(json.error ?? "Zahtjev nije uspio");
        return;
      }
      setIssued({ accessUrl: json.data.accessUrl, token: json.data.token });
    } catch {
      setError("Mrežna greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-slate-500" aria-hidden />
          Guest pristup (link bez naloga)
        </CardTitle>
        <p className="text-sm text-[#64748B]">
          U bazi se čuva samo <strong className="font-medium text-slate-700">heš</strong> tokena, ne i sam token — zato
          izgubljenog linka nije moguće „prikazati“. Možete izdati <strong className="font-medium text-slate-700">novi</strong>{" "}
          link i poslati ga korisniku; stari link tada više ne radi.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hadGuestToken && (
          <p className="text-sm text-amber-800">
            Za ovaj zahtjev trenutno nema guest tokena u bazi. Izdavanjem linka omogućavate pristup stranici zahtjeva bez
            prijave.
          </p>
        )}

        {canReissue && (
          <Button type="button" variant="secondary" disabled={loading} onClick={() => void reissue()}>
            {loading ? "Izdavanje…" : "Izdaj novi pristupni link"}
          </Button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {issued && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Puni link</p>
              <p className="mt-1 break-all font-mono text-sm text-slate-800">{issued.accessUrl}</p>
              <Button type="button" size="sm" className="mt-2" onClick={() => void copyText("url", issued.accessUrl)}>
                {copied === "url" ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                Kopiraj link
              </Button>
            </div>
            <div className="border-t border-slate-200/80 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Samo token (za SMS / ručni unos)</p>
              <p className="mt-1 break-all font-mono text-sm text-slate-800">{issued.token}</p>
              <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => void copyText("token", issued.token)}>
                {copied === "token" ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                Kopiraj token
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
