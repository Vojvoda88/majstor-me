"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/request/create")}
      className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-md cursor-pointer hover:border-[#2563EB]/40 hover:shadow-lg transition-all"
    >
      <Search className="h-5 w-5 text-[#94A3B8] flex-shrink-0" />
      <span className="flex-1 text-[#94A3B8] text-sm">Šta vam treba?</span>
      <span className="text-xs text-[#64748B] hidden sm:inline">
        vodoinstalater · klima · električar
      </span>
      <Button size="sm" className="shrink-0">
        Pretraži
      </Button>
    </div>
  );
}
