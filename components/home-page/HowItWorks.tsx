import { ClipboardList, MessageSquare, BadgeCheck } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Objavite zahtjev", desc: "Opišite posao i grad." },
  { icon: MessageSquare, title: "Primite ponude", desc: "Majstori šalju ponude." },
  { icon: BadgeCheck, title: "Izaberite majstora", desc: "Pogledajte ocjene i izaberite." },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="mt-12 md:mt-16">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Kako funkcioniše</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <Icon className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="font-semibold text-[#0F172A]">{title}</h3>
              <p className="mt-2 text-sm text-[#475569]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
