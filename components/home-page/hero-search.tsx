"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/request/create")}
      className="mt-8 max-w-2xl cursor-pointer rounded-[28px] border border-white/80 bg-white/90 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex h-14 flex-1 items-center rounded-2xl bg-slate-50 px-4">
          <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
          <span className="text-base text-slate-400">Šta vam treba?</span>
        </div>
        <div className="hidden text-sm text-slate-500 lg:block">
          vodoinstalater • klima • električar
        </div>
        <button className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700">
          Pretraži
        </button>
      </div>
    </div>
  );
}
