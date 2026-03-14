import { ClipboardList, MessageSquare, BadgeCheck } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Objavite zahtjev", desc: "Opišite posao i grad." },
  { icon: MessageSquare, title: "Primite ponude", desc: "Majstori šalju ponude." },
  { icon: BadgeCheck, title: "Izaberite majstora", desc: "Pogledajte ocjene i izaberite." },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="mt-8 md:mt-12">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Kako funkcioniše</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-[20px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#E0F2FE]">
                <Icon className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="font-semibold text-[#0F172A]">{title}</h3>
              <p className="mt-1 text-sm text-[#475569]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
