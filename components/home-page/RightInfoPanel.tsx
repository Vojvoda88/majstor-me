"use client";

import Link from "next/link";
import { Paperclip } from "lucide-react";

type Props = {
  title?: string;
};

export function RightInfoPanel({ title = "Primjer zahtjeva" }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-[#475569]">Sortiraj: Najbolje ocijenjeni</p>
      <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Budžet</p>
          <p className="text-xl font-bold text-[#0F172A]">40 EUR</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Datum</p>
          <p className="text-sm text-[#475569]">10. mart 2024.</p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            Opis
            <Paperclip className="h-4 w-4 text-[#475569]" />
          </p>
          <p className="mt-1 text-sm text-[#475569]">
            Slavina curi i potrebno je zameniti mehanizam. Hitno potrebna popravka.
          </p>
        </div>
      </div>
      <Link
        href="/request/create"
        className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#2563EB] text-[15px] font-semibold text-white transition hover:bg-[#1D4ED8]"
      >
        Zatraži majstora
      </Link>
    </div>
  );
}
