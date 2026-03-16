import { ShieldCheck, Zap, CreditCard } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Provjereni majstori iz CG",
    desc: "Svaki aktivan majstor prolazi osnovnu provjeru profila, a dodatno se ističu oni sa verifikacijom i ocjenama korisnika.",
  },
  {
    icon: Zap,
    title: "Jedan zahtjev, više ponuda",
    desc: "Umjesto da zovete majstore redom, opišete posao jednom i dobijete ponude više majstora iz vašeg grada.",
  },
  {
    icon: CreditCard,
    title: "Besplatno i bez obaveze",
    desc: "Objava zahtjeva je besplatna. Ponude gledate u miru i sami odlučujete kome ćete se javiti i kada.",
  },
];

export function WhyMajstorSection() {
  return (
    <section className="py-16 lg:py-20">
      <h2 className="font-display mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        Zašto Majstor.me?
      </h2>
      <p className="mb-10 max-w-xl text-sm text-slate-500 md:mb-14 md:text-base">
        Platforma je napravljena za realne poslove u Crnoj Gori – od pukle cijevi i klima servisa do selidbi i
        renoviranja.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition duration-300 hover:border-slate-200 hover:shadow-card md:p-8"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1d4ed8] md:h-14 md:w-14">
              <Icon className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">{title}</h3>
            <p className="text-xs leading-relaxed text-slate-500 md:text-[15px]">{desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-6 py-4 text-emerald-800 md:mt-12">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold">
          Sve ponude stižu direktno od majstora – Majstor.me ne uzima proviziju od korisnika.
        </span>
      </div>
    </section>
  );
}
