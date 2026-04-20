"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LeaveReviewFormProps {
  requestId: string;
  handymanName: string;
  onSuccess?: () => void;
}

export function LeaveReviewForm({ requestId, handymanName, onSuccess }: LeaveReviewFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (rating === 0) {
      setError("Izaberite ocjenu (1–5 zvjezdica).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, rating, comment: comment.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Greška pri slanju recenzije.");
        return;
      }
      setDone(true);
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        Recenzija je sačuvana. Hvala!
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
      >
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        Ocijeni majstora {handymanName}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">
        Ocijeni majstora <span className="text-blue-600">{handymanName}</span>
      </p>

      {/* Zvjezdice */}
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`${n} zvjezdica`}
          >
            <Star
              className={`h-7 w-7 ${
                n <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-1 self-center text-sm text-slate-500">
            {["", "Loše", "Ispod prosjeka", "Dobro", "Odlično", "Izvrsno"][rating]}
          </span>
        )}
      </div>

      {/* Komentar */}
      <Textarea
        placeholder="Kratki komentar (opciono) — kvalitet rada, tačnost, komunikacija..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        className="text-sm"
      />
      <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/1000</p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={submit} disabled={loading || rating === 0}>
          {loading ? "Šaljem..." : "Pošalji recenziju"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setRating(0);
            setComment("");
            setError("");
          }}
        >
          Odustani
        </Button>
      </div>
    </div>
  );
}
