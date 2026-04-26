"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOW_CREDITS_THRESHOLD } from "@/lib/credits";

/** Kompaktan prikaz salda u headeru (samo majstori). */
export function HandymanCreditsPill() {
  const { data, isLoading } = useQuery({
    queryKey: ["handyman-credits-balance"],
    queryFn: async () => {
      const res = await fetch("/api/handyman/credits-balance", { credentials: "include" });
      const json = (await res.json()) as { ok?: boolean; balance?: number };
      if (!json.ok) return null;
      return json.balance ?? 0;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <span
        className="inline-block h-8 min-w-[3.5rem] max-[380px]:h-7 max-[380px]:min-w-[3rem] animate-pulse rounded-full bg-slate-100 sm:h-9 sm:min-w-[4.5rem]"
        aria-hidden
      />
    );
  }

  if (data == null) return null;

  const low = data > 0 && data < LOW_CREDITS_THRESHOLD;

  return (
    <Link
      href="/dashboard/handyman/credits"
      id="credits"
      className={cn(
        "inline-flex max-w-[4.5rem] shrink-0 items-center gap-0.5 rounded-full border py-1 pl-1.5 pr-1.5 text-[11px] font-semibold tabular-nums transition max-[380px]:max-w-[4rem] sm:max-w-none sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm",
        low
          ? "border-amber-300/90 bg-amber-50 text-amber-950 shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
      )}
      title={low ? "Malo kredita — klik za dopunu" : "Krediti — klik za dopunu"}
    >
      <Coins className="h-3.5 w-3.5 shrink-0 text-amber-600 sm:h-4 sm:w-4" aria-hidden />
      <span>{data}</span>
      {low && (
        <span className="hidden text-[10px] font-bold uppercase tracking-wide text-amber-800 sm:inline">Nisko</span>
      )}
    </Link>
  );
}
