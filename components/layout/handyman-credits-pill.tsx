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
      <span className="inline-block h-9 min-w-[4.5rem] animate-pulse rounded-full bg-slate-100" aria-hidden />
    );
  }

  if (data == null) return null;

  const low = data > 0 && data < LOW_CREDITS_THRESHOLD;

  return (
    <Link
      href="/dashboard/handyman/credits"
      id="credits"
      className={cn(
        "inline-flex max-w-[4.75rem] shrink-0 items-center gap-0.5 rounded-full border py-1.5 pl-1.5 pr-2 text-[12px] font-semibold tabular-nums transition sm:max-w-none sm:gap-1.5 sm:px-3 sm:text-sm",
        low
          ? "border-amber-300/90 bg-amber-50 text-amber-950 shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
      )}
      title={low ? "Malo kredita — klik za dopunu" : "Krediti — klik za dopunu"}
    >
      <Coins className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <span>{data}</span>
      {low && (
        <span className="hidden text-[10px] font-bold uppercase tracking-wide text-amber-800 sm:inline">Nisko</span>
      )}
    </Link>
  );
}
