"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequestPayload = {
  draft: string;
  category?: string;
  city?: string;
  currentTitle?: string;
};

type Props =
  | {
      kind: "request_draft";
      getPayload: () => RequestPayload;
      onApply: (r: { title: string; description: string }) => void;
    }
  | {
      kind: "handyman_bio";
      getPayload: () => { draft: string };
      onApply: (r: { bio: string }) => void;
    };

export function AiAssistChip(props: Props) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function run() {
    setHint(null);

    if (props.kind === "handyman_bio") {
      const payload = props.getPayload();
      if (!payload.draft.trim()) {
        setHint("Prvo unesite bar kratke bilješke o sebi i uslugama.");
        return;
      }
      setLoading(true);
      try {
        const body = { kind: "handyman_bio" as const, draft: payload.draft };
        await sendAssist(body, props);
      } finally {
        setLoading(false);
      }
      return;
    }

    const payload = props.getPayload();
    if (!payload.draft.trim() && !payload.currentTitle?.trim()) {
      setHint("Unesite bar naslov ili par rečenica u opisu.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        kind: "request_draft" as const,
        draft: payload.draft,
        category: payload.category,
        city: payload.city,
        currentTitle: payload.currentTitle,
      };
      await sendAssist(body, props);
    } finally {
      setLoading(false);
    }
  }

  async function sendAssist(
    body:
      | { kind: "handyman_bio"; draft: string }
      | {
          kind: "request_draft";
          draft: string;
          category?: string;
          city?: string;
          currentTitle?: string;
        },
    p: Props
  ) {
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { title?: string; description?: string; bio?: string };
      };

      if (!res.ok || !json.success) {
        setHint(json.error ?? "Zahtjev nije uspio.");
        return;
      }

      if (p.kind === "handyman_bio" && json.data?.bio) {
        p.onApply({ bio: json.data.bio });
        setHint("Tekst je umetnut — provjerite i prilagodite prije čuvanja.");
      } else if (p.kind === "request_draft" && json.data?.title && json.data?.description) {
        p.onApply({ title: json.data.title, description: json.data.description });
        setHint("Predlog je umetnut — provjerite prije slanja.");
      } else {
        setHint("Neočekivan odgovor. Pokušajte ponovo.");
      }
    } catch {
      setHint("Mrežna greška. Pokušajte ponovo.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-fit gap-2 border-violet-200 bg-violet-50/80 text-violet-900 hover:bg-violet-100"
        disabled={loading}
        onClick={() => void run()}
      >
        {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4 shrink-0" aria-hidden />}
        Pomoć AI (beta)
      </Button>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
      <p className="text-[11px] leading-snug text-slate-400">
        Besplatni model (Google AI Studio). Predlog provjerite uvijek ručno — ne šalje se automatski.
      </p>
    </div>
  );
}
