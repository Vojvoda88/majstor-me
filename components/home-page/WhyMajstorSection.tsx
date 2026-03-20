import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const BENEFITS = [
  {
    id: "01",
    title: "Provjereni majstori iz CG",
    body: "Aktivni profili, ocjene klijenata i jasna verifikacija — birate sigurnije.",
    icon: ShieldCheck,
  },
  {
    id: "02",
    title: "Majstori iz vašeg grada",
    body: "Filtri po gradu i vrsti posla — manje zvanja, više konkretnih ponuda.",
    icon: MapPin,
  },
  {
    id: "03",
    title: "Besplatno i bez obaveze",
    body: "Objava zahtjeva je besplatna; ponude pregledate u miru i odlučujete sami.",
    icon: Sparkles,
  },
];

export function WhyMajstorSection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16 lg:items-start">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800/40 bg-gradient-to-br from-brand-navy via-[#0c1f3d] to-[#132d52] p-8 text-white shadow-premium md:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.28em] text-blue-200/90">ZAŠTO MARKETPLACE</p>
          <h2 className="relative mt-4 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem]">
            Zašto BrziMajstor.ME?
          </h2>
          <p className="relative mt-6 max-w-lg text-[15px] leading-relaxed text-slate-100/95 md:text-base">
            Platforma je građena za stvarne poslove u Crnoj Gori — od curenja i klima servisa do selidbi i renoviranja. Jedan
            zahtjev, više ponuda, jasna komunikacija.
          </p>
          <div className="relative mt-10 grid gap-3 border-t border-white/10 pt-10 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">ZA KLIJENTE</p>
              <p className="mt-2 text-sm font-semibold leading-snug">Bez provizije na vašu stranu</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">TRANSPARENTNO</p>
              <p className="mt-2 text-sm font-semibold leading-snug">Ponude direktno od majstora</p>
            </div>
          </div>
          <Link
            href="/register"
            className="relative mt-10 inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-amber-200"
          >
            Registruj se besplatno
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="flex flex-col gap-5 md:gap-6">
          {BENEFITS.map(({ id, title, body, icon: Icon }) => (
            <li
              key={id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_28px_-12px_rgba(10,22,40,0.12)] md:p-7 lg:p-8"
            >
              <div className="flex gap-4 md:gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white shadow-md md:h-14 md:w-14 md:rounded-2xl">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Prednost {id}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-brand-navy md:text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-[15px]">{body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 flex items-start gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-6 py-5 text-emerald-950 shadow-sm md:mt-14 md:items-center md:px-8 md:py-6">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 md:mt-0" />
        <p className="text-sm font-semibold leading-relaxed md:text-base">
          Sve ponude stižu direktno od majstora — BrziMajstor.ME ne uzima proviziju od korisnika.
        </p>
      </div>
    </section>
  );
}
