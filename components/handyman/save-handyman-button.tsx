"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveHandymanButtonProps {
  handymanId: string;
  initialSaved: boolean;
}

export function SaveHandymanButton({ handymanId, initialSaved }: SaveHandymanButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-handymen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handymanId }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(json.data.saved);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Ukloni iz sačuvanih" : "Sačuvaj majstora"}
      className={cn(
        "inline-flex h-14 items-center justify-center gap-2 rounded-2xl border px-5 font-semibold transition",
        saved
          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition",
          saved ? "fill-rose-500 text-rose-500" : "fill-transparent"
        )}
      />
      {saved ? "Sačuvano" : "Sačuvaj majstora"}
    </button>
  );
}
