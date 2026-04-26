"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Field = "bio" | "serviceAreasDescription";

type Payload = {
  field: Field;
  notes: string;
  categories: string[];
  cities: string[];
  yearsOfExperience: number | null | undefined;
  travelRadiusKm: number | null | undefined;
  availabilityStatus: "AVAILABLE" | "BUSY" | "EMERGENCY_ONLY" | null | undefined;
};

type Props = {
  enabled: boolean;
  field: Field;
  getPayload: () => Payload;
  onApply: (text: string) => void;
  label?: string;
};

export function AiSuggestTextButton({
  enabled,
  field,
  getPayload,
  onApply,
  label = "Predloži pomoću AI",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  const run = async () => {
    setError(null);
    setLoading(true);
    try {
      const p = getPayload();
      const res = await fetch("/api/handyman/ai-suggest-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          field: p.field,
          notes: p.notes,
          categories: p.categories,
          cities: p.cities,
          yearsOfExperience: p.yearsOfExperience ?? null,
          travelRadiusKm: p.travelRadiusKm ?? null,
          availabilityStatus: p.availabilityStatus ?? "AVAILABLE",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      if (!res.ok || !json.ok || typeof json.text !== "string") {
        setError(json.error || "Nije moguće dobiti predlog.");
        return;
      }
      onApply(json.text);
    } catch {
      setError("Mrežna greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[40px] touch-manipulation"
        onClick={() => void run()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="ml-2">{label}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
