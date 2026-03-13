import { FileText, Mail, UserCheck } from "lucide-react";

const steps = [
  { icon: FileText, title: "Objavi zahtjev", description: "Opišite svoj problem i pošaljite zahtjev." },
  { icon: Mail, title: "Dobij ponude", description: "Primite ponude od majstora." },
  { icon: UserCheck, title: "Izaberi majstora", description: "Odaberite & ugovorite najpovoljnijeg." },
];

export function HowItWorksSection() {
  return (
    <section id="kako-radi" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0F172A] mb-10">
          Kako funkcioniše?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center w-full sm:w-56 border border-[#E2E8F0]">
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1">{step.title}</h3>
                <p className="text-sm text-[#475569]">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-6 h-6 text-[#CBD5E1] flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
