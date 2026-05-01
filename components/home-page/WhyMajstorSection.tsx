import { MapPin, Sparkles } from "lucide-react";

const BENEFITS = [
  {
    id: "01",
    title: "Lokalno, bez zvanja redom",
    body: "Nakon kratke provjere, slobodni majstori iz vaše okoline mogu vas pozvati ili poslati ponudu.",
    icon: MapPin,
  },
  {
    id: "02",
    title: "Besplatno za vas",
    body: "Zahtjev objavljujete bez naknade; pozive i ponude gledate kad vama odgovara.",
    icon: Sparkles,
  },
];

export function WhyMajstorSection() {
  return (
    <section className="relative py-10 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14 lg:items-start">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-gradient-to-br from-slate-800 via-brand-navy to-[#152a45] p-8 text-white shadow-[0_24px_56px_-28px_rgba(10,22,40,0.22)] md:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-amber-400/12 blur-3xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.28em] text-blue-200/90">ZAŠTO MARKETPLACE</p>
          <h2 className="relative mt-4 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem]">
            Zašto BrziMajstor.ME?
          </h2>
          <p className="relative mt-4 max-w-lg text-[15px] leading-relaxed text-slate-100/95 sm:mt-6 md:text-base">
            Brza objava u Crnoj Gori — od sitnih popravki do većih radova, bez zvanja liste brojeva.
          </p>
          <div className="relative mt-8 grid gap-2.5 border-t border-white/10 pt-8 sm:grid-cols-2 sm:gap-3 md:mt-10 md:pt-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">ZA KLIJENTE</p>
              <p className="mt-2 text-sm font-semibold leading-snug">Bez provizije na vašu stranu</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">TRANSPARENTNO</p>
              <p className="mt-2 text-sm font-semibold leading-snug">Razgovor direktno s majstorom</p>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-3.5 md:gap-6">
          {BENEFITS.map(({ id, title, body, icon: Icon }) => (
            <li
              key={id}
              className="rounded-2xl border border-slate-100/90 bg-white p-5 shadow-[0_12px_40px_-20px_rgba(10,22,40,0.1)] ring-1 ring-slate-50 md:p-7 lg:p-8"
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
    </section>
  );
}
