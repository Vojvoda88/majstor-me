import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTAForMasters() {
  return (
    <section className="py-20 md:py-28">
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-900/25 bg-gradient-to-br from-brand-navy via-[#0f2847] to-[#0a1628] p-10 shadow-[0_24px_64px_-20px_rgba(10,22,40,0.35)] md:p-14 lg:p-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex max-w-4xl flex-col gap-10 md:flex-row md:items-center md:justify-between md:gap-14">
          <div>
            <h3 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Vi ste majstor?</h3>
            <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-200 md:text-lg">
              Prijavite profil besplatno. Primajte zahtjeve od klijenata. Bez provizije na objavljivanje.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-9 text-base font-bold text-brand-navy shadow-[0_14px_36px_-8px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.98] md:h-[56px] md:px-10"
          >
            Prijavite se kao majstor
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
