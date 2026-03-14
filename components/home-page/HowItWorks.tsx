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
    <section id="kako-radi" className="py-10 sm:py-14 lg:py-16">
      <h2 className="mb-4 text-center text-2xl font-semibold text-gray-900 sm:mb-6 sm:text-3xl">
        Kako funkcioniše
      </h2>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md sm:p-8"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                {step.desc}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
