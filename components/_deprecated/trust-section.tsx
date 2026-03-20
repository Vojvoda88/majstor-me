import { ShieldCheck, Star, Zap, MapPin } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Provjereni majstori", description: "Svi majstori su lično verifikovani." },
  { icon: Star, title: "Visoke ocjene", description: "Prosječna ocjena od zadovoljnih korisnika." },
  { icon: Zap, title: "Brze ponude", description: "Ponude stižu u roku od 24h." },
  { icon: MapPin, title: "Lokalna podrška", description: "Tu smo, lokalno u vašem gradu." },
];

export function TrustSection() {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0F172A] mb-8">
          Zašto odabrati BrziMajstor.ME?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-[#0F172A]">{title}</h3>
              <p className="mt-2 text-sm text-[#64748B]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
