import { ClipboardList, MessageSquare, BadgeCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Objavite zahtjev",
    desc: "Opišite posao i grad.",
  },
  {
    icon: MessageSquare,
    title: "Primite ponude",
    desc: "Majstori šalju ponude.",
  },
  {
    icon: BadgeCheck,
    title: "Izaberite majstora",
    desc: "Pogledajte ocjene i izaberite.",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="py-10 lg:py-12">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          KAKO FUNKCIONIŠE
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-2xl border border-white/80 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                {step.desc}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
