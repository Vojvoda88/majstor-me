import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type LandingValueBlockProps = {
  /** Puno formulisano pitanje, npr. „Treba vam vodoinstalater u Podgorici?“ */
  heading: string;
  href: string;
};

/**
 * Statički trust + konverzija ispod naslova na category/city landing stranicama (uvijek vidljivo, ne čeka API).
 */
export function LandingValueBlock({ heading, href }: LandingValueBlockProps) {
  return (
    <section
      className="mb-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50/95 via-white to-sky-50/30 p-6 shadow-sm ring-1 ring-slate-100/80 md:mb-10 md:p-8"
      aria-labelledby="landing-value-heading"
    >
      <h2 id="landing-value-heading" className="font-display text-lg font-bold text-brand-navy md:text-xl">
        {heading}
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-700 md:text-[15px]">
        <li className="flex gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <span>
            <strong className="font-semibold text-slate-900">Zatražite majstora besplatno</strong> — ne morate zvati više
            brojeva redom.
          </span>
        </li>
        <li className="flex gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <span>
            Opišite posao i po želji dodajte slike; nakon odobrenja zahtjeva majstori koji vide posao mogu poslati ponude.
          </span>
        </li>
        <li className="flex gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <span>Pregledajte ponude u svom ritmu — bez obaveze da prihvatite.</span>
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 text-base font-bold text-white shadow-btn-cta transition hover:brightness-105 active:scale-[0.99]"
        >
          Zatraži majstora
        </Link>
        <Link href="/categories" className="text-sm font-semibold text-blue-800 underline-offset-4 hover:underline">
          Sve kategorije
        </Link>
      </div>
    </section>
  );
}
