"use client";

import { ShieldCheck, Star, Map } from "lucide-react";
import { HeroSearch } from "./hero-search";

export function Hero() {
  return (
    <section className="pt-[88px] pb-6 md:pt-24 md:pb-8">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <div className="overflow-hidden rounded-[28px] border border-[rgba(191,219,254,0.7)] bg-gradient-to-b from-[rgba(219,234,254,0.85)] to-[rgba(255,255,255,0.92)] p-5 shadow-[0_16px_40px_rgba(37,99,235,0.10)] md:p-8">
          <h1 className="max-w-[90%] text-[28px] font-bold leading-[1.15] text-[#0F172A] md:text-3xl">
            Pronađite majstora za svaki posao
          </h1>
          <p className="mt-2 mb-[18px] text-base leading-relaxed text-[#475569]">
            Brzo, lako i provjereno
          </p>

          <div className="mt-[18px] rounded-[20px] border border-white/70 bg-white/95 p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-[14px] md:p-4">
            <HeroSearch />
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-2.5">
            {[
              { icon: ShieldCheck, text: "Verifikovani" },
              { icon: Star, text: "Ocjena 4.8" },
              { icon: Map, text: "Cijela CG" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-[14px] bg-white/80 px-2.5 py-3 text-center">
                <Icon className="mx-auto mb-1 h-5 w-5 text-[#2563EB]" />
                <span className="text-xs font-medium text-[#475569]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
